<template lang="pug">
div
    NTabs(
        type='line'
        v-model:value='tabName'
    )
        NTab(name='viewer') Viewer
        NTab(name='editor') Editor
    div.margin-up-down(
        v-html='mdText'
        v-show=`tabName === 'viewer'`
    )
    div.margin-up-down(v-show=`tabName === 'editor'`)
        p {{saved}}
        div.margin-up-down(ref='editor')
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Snapshot } from './states';
import { NInput, NCard, NTabs, NTab, } from 'naive-ui';
import MarkdownIt = require('markdown-it');
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import '../katex/katex.min.css';
import CodeFlask from 'codeflask';
import markdownItLatex2img = require('markdown-it-latex2img');
import { debounce } from 'lodash';


const markdownIt = new MarkdownIt({
    linkify: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, {
                    language: lang, ignoreIllegals: false,
                }).value;
            } catch (err) {
                console.error(err);
            }
        }
        return '';
    }
});
markdownIt.use(markdownItLatex2img);


export default defineComponent({
    emits: ['update:modelValue'],
    inject: ['state'],
    mounted() {
        const editor = new CodeFlask(this.$refs.editor, {
            tabSize: 4,
        });
        editor.updateCode(this.state.view);
        this.$data.original = this.state.view;
        const debouncedOnUpdate = debounce((code: string) => {
            this.state.view = code;
            this.backup(code);
            this.saved = '💾 Saved locally.';
        }, 1000);
        let editorFirstStart = true;
        editor.onUpdate((code: string) => {
            if (editorFirstStart) {
                editorFirstStart = false;
                return;
            }
            this.saved = '✏️ Editing...';
            debouncedOnUpdate(code);
        });
    },
    computed: {
        mdText() {
            return markdownIt.render(this.state.view);
        }
    },
    data() {
        return {
            tabName: 'viewer',
            saved: '💾 Saved.',
        }
    },
    methods: {
        backup() {
            const snapshot: Snapshot = {
                branch: this.state.branch,
                root: this.state.root,
                filePathArray: this.state.filePathArray,
                text: this.state.view,
            };
            globalThis.localStorage.setItem('backup', JSON.stringify(snapshot));
        }
    },
    components: {
        NInput,
        NCard,
        NTabs,
        NTab,
    }
});
</script>

<style lang="stylus" scoped>
.margin-up-down
    margin-top 5px
.margin-right
    margin-right: 5px
</style>
