<template lang="pug">
div#root
    div.margin-up-down: NInput(
        type='text'
        v-model:value="filePath"
        readonly
    )
    div.margin-up-down: NButton.full-width(
        :disabled=`!buttonVisibility('onUpwards')`
        @click='onUpwards'
    ) Up
    div.margin-up-down: NButton.full-width(
        :disabled=`!buttonVisibility('onMkdir')`
        @click='onMkdir'
    ) New directory
    div.margin-up-down: NButton.full-width(
        :disabled=`!buttonVisibility('onMkmd')`
        @click='onMkmd'
    ) New markdown
    div.margin-up-down: NButton.full-width(
        :disabled=`!buttonVisibility('onRemove')`
        @click='onRemove'
    ) Remove
    div.margin-up-down: NButton.full-width(
        :disabled=`!buttonVisibility('onReload')`
        @click='onReload'
    ) Reload
    div.margin-up-down: component(
        :is='viewComponentName'
        v-bind='viewComponentProps'
        v-on='viewComponentListeners'
    )
</template>

<script lang="ts">
import { PropType, defineComponent, reactive } from 'vue';
import ViewDirectory from './ViewDirectory.vue';
import ViewRegularFile from './ViewRegularFile.vue';
import Downloading from './Downloading.vue';
import DownloadFailed from './DownloadFailed.vue';
import UploadingRegularFile from './UploadingRegularFile.vue';
import UploadingDirectory from './UploadingDirectory.vue';
import {
    FnodeId,
    SubscriptionsView,
} from './interfaces';
import { State, SyncState, Snapshot } from './states';
import config = require('./config.json');
import Mime = require('whatwg-mimetype');
import chai = require('chai');
import { NButton, NInput } from 'naive-ui';
const assert = chai.assert;


export default defineComponent({
    async mounted() {
        const snapshotString = globalThis.localStorage.getItem('backup');
        if (snapshotString !== null) {
            const snapshot: Snapshot = JSON.parse(snapshotString);
            this.state.sync = SyncState.DL_SUCC_REGULAR_FILE;
            this.state.branch = snapshot.branch;
            this.state.root = snapshot.root;
            this.state.filePathArray = snapshot.filePathArray;
            this.state.view = snapshot.text;
        } else {
            await this.onReload();
        }
    },
    provide() {
        return {
            state: reactive(this.state),
        };
    },
    data() {
        return {
            state: {
                branch: 1,
                root: 0,
                filePathArray: [],
                sync: SyncState.DL_ING,
                view: null,
            } as State,
        };
    },
    computed: {
        filePath(): string {
            return '/' + this.state.filePathArray.join('/');
        },
        urlPathArray(): string[] {
            return ['files'].concat(this.state.filePathArray);
        },
        viewComponentName(): string {
            switch (this.state.sync) {
                case SyncState.DL_SUCC_REGULAR_FILE: return 'ViewRegularFile';
                case SyncState.DL_SUCC_DIRECTORY: return 'ViewDirectory';
                case SyncState.DL_ING: return 'Downloading';
                case SyncState.DL_FAIL: return 'DownloadFailed';
                case SyncState.UL_ING_REGULAR_FILE: return 'UploadingRegularFile';
                case SyncState.UL_ING_DIRECTORY: return 'UploadingDirectory';
                default: throw new Error();
            }
        },
        viewComponentProps(): {} {
            switch (this.state.sync) {
                default: return {};
            }
        },
        viewComponentListeners(): {} {
            switch (this.state.sync) {
                case SyncState.DL_SUCC_DIRECTORY: return {
                    downwards: this.onDownwards,
                };
                default: return {};
            }
        }
    },
    methods: {
        buttonVisibility(listener: string): boolean {
            switch (listener) {
                case 'onReload':
                    return this.state.sync === SyncState.DL_SUCC_DIRECTORY ||
                        this.state.sync === SyncState.DL_SUCC_REGULAR_FILE ||
                        this.state.sync === SyncState.DL_FAIL;
                case 'onMkdir':
                    return this.state.sync === SyncState.DL_SUCC_DIRECTORY;
                case 'onMkmd':
                    return this.state.sync === SyncState.DL_SUCC_DIRECTORY;
                case 'onUpwards':
                    return (
                        this.state.sync === SyncState.DL_SUCC_DIRECTORY ||
                        this.state.sync === SyncState.DL_SUCC_REGULAR_FILE
                    ) && this.state.filePathArray.length > 0;
                case 'onRemove':
                    return (
                        this.state.sync === SyncState.DL_SUCC_REGULAR_FILE ||
                        this.state.sync === SyncState.DL_SUCC_DIRECTORY &&
                        this.state.view.length === 0
                    ) && this.state.filePathArray.length > 0;
            }
        },
        async getLatestRoot(): Promise<FnodeId> {
            this.state.sync = SyncState.DL_ING;

            const res = await fetch(
                config.BACKEND_BASEURL + 'subscriptions', {
                credentials: 'include',
            });
            assert(res.ok);
            assert(res.headers.has('Content-Type'));
            const mime = new Mime(res.headers.get('Content-Type'));
            assert(mime.essence === 'application/json');
            const s10ns = <SubscriptionsView>await res.json();
            const s10n = s10ns.find(s10n => s10n.branchId === this.state.branch);
            assert(s10n);
            return s10n.latestVersionId;
        },
        async onMkmd() {
            try {
                try {
                    this.state.sync = SyncState.UL_ING_DIRECTORY;

                    const name = globalThis.prompt('Document name:');
                    if (typeof name !== 'string') return;
                    const res = await fetch(
                        config.BACKEND_BASEURL + [...this.urlPathArray, name].join('/'), {
                        method: 'PATCH',
                        headers: {
                            'Branch-Id': String(this.state.branch),
                            'Root-File-Id': String(this.state.root),
                            'Time': String(Date.now()),
                            'Content-Type': 'text/markdown',
                        },
                        credentials: 'include',
                        body: '',
                    });
                    assert(res.ok);
                    assert(res.headers.has('Root-File-Id'));
                    this.state.root = Number(res.headers.get('Root-File-Id'));
                } catch (err) {
                    this.state.sync = SyncState.DL_SUCC_DIRECTORY;
                    throw err;
                }
                try {
                    await this.refresh();
                } catch (err) {
                    this.state.sync = SyncState.DL_FAIL;
                    throw err;
                }
            } catch (err) { }

        },
        async onUpwards() {
            try {
                if (this.state.filePathArray.length === 0) return;
                try {
                    if (
                        this.state.sync === SyncState.DL_SUCC_REGULAR_FILE &&
                        globalThis.localStorage.getItem('backup') !== null
                    )
                        await this.save(this.state.view);
                } catch (err) {
                    this.state.sync = SyncState.DL_SUCC_REGULAR_FILE;
                    throw err;
                }
                try {
                    this.state.filePathArray.pop();
                    await this.refresh();
                } catch (err) {
                    this.state.sync = SyncState.DL_FAIL;
                    throw err;
                }
            } catch (err) { }
        },
        async onMkdir() {
            try {
                try {
                    const name = globalThis.prompt('Directory name:');
                    if (typeof name !== 'string') return;
                    this.state.sync = SyncState.UL_ING_DIRECTORY;
                    const res = await fetch(
                        config.BACKEND_BASEURL + [...this.urlPathArray, name].join('/'), {
                        method: 'PATCH',
                        headers: {
                            'Branch-Id': String(this.state.branch),
                            'Root-File-Id': String(this.state.root),
                            'Time': String(Date.now()),
                        },
                        credentials: 'include',
                    });
                    assert(res.ok);
                    assert(res.headers.has('Root-File-Id'));
                    this.state.root = Number(res.headers.get('Root-File-Id'));
                } catch (err) {
                    this.state.sync = SyncState.DL_SUCC_DIRECTORY;
                    throw err;
                }
                try {
                    await this.refresh();
                } catch (err) {
                    this.state.sync = SyncState.DL_FAIL;
                    throw err;
                }
            } catch (err) { }
        },
        async remove() {
            if (!globalThis.confirm('Confirm to remove')) return;
            this.state.sync = this.state.sync === SyncState.DL_SUCC_DIRECTORY
                ? SyncState.UL_ING_DIRECTORY
                : SyncState.UL_ING_REGULAR_FILE;
            const res = await fetch(
                config.BACKEND_BASEURL + [...this.urlPathArray].join('/'), {
                method: 'DELETE',
                headers: {
                    'Branch-Id': String(this.state.branch),
                    'Root-File-Id': String(this.state.root),
                    'Time': String(Date.now()),
                },
                credentials: 'include',
            });
            assert(res.ok);
            assert(res.headers.has('Root-File-Id'));
            this.state.root = Number(res.headers.get('Root-File-Id'));
            globalThis.localStorage.removeItem('backup');
        },
        async onRemove() {
            try {
                try {
                    await this.remove();
                } catch (err) {
                    this.state.sync = this.state.sync === SyncState.UL_ING_DIRECTORY
                        ? SyncState.DL_SUCC_DIRECTORY
                        : SyncState.DL_SUCC_REGULAR_FILE;
                    throw err;
                }
                try {
                    this.state.filePathArray.pop();
                    await this.refresh();
                } catch (err) {
                    this.state.sync = SyncState.DL_FAIL;
                    throw err;
                }
            } catch (err) { }
        },
        async refresh() {
            this.state.sync = SyncState.DL_ING;

            const res = await fetch(
                config.BACKEND_BASEURL + [...this.urlPathArray].join('/'), {
                headers: {
                    'Branch-Id': String(this.state.branch),
                    'Root-File-Id': String(this.state.root),
                },
                credentials: 'include',
            });
            assert(res.ok);
            assert(res.headers.has('Content-Type'));
            const mime = new Mime(res.headers.get('Content-Type'));
            if (mime.essence === 'application/json') {
                // Vue renders asyncly.
                const newView = await res.json();
                this.state.sync = SyncState.DL_SUCC_DIRECTORY;
                this.state.view = newView;
            } else if (mime.essence === 'text/markdown') {
                const newView = await res.text();
                this.state.sync = SyncState.DL_SUCC_REGULAR_FILE;
                this.state.view = newView;
            } else throw new Error();
        },
        async save(text: string) {
            this.state.sync = SyncState.UL_ING_REGULAR_FILE;

            const res = await fetch(
                config.BACKEND_BASEURL + [...this.urlPathArray].join('/'), {
                method: 'PUT',
                headers: {
                    'Branch-Id': String(this.state.branch),
                    'Root-File-Id': String(this.state.root),
                    'Time': String(Date.now()),
                    'Content-Type': 'text/markdown',
                },
                body: text,
                credentials: 'include',
            });
            assert(res.ok);
            assert(res.headers.has('Root-File-Id'));
            this.state.root = Number(res.headers.get('Root-File-Id'));

            globalThis.localStorage.removeItem('backup');
        },
        async onDownwards(name: string) {
            try {
                this.state.filePathArray.push(name);
                await this.refresh();
            } catch (err) {
                this.state.sync = SyncState.DL_FAIL;
            }
        },
        async onReload() {
            try {
                globalThis.localStorage.removeItem('backup');
                this.state.root = await this.getLatestRoot();
                await this.refresh();
            } catch (err) {
                this.state.sync = SyncState.DL_FAIL;
            }
        },
    },
    components: {
        ViewDirectory,
        ViewRegularFile,
        Downloading,
        DownloadFailed,
        UploadingRegularFile,
        UploadingDirectory,
        NButton,
        NInput,
    }
});
</script>

<style lang="stylus" scoped>
.full-width
    width 100%
.margin-up-down
    margin-top 5px
body
    overflow-x hidden
    overflow-y scroll
div#root
    margin 5vw
    word-wrap break-word
    width 90vw
    overflow-x hidden
</style>
