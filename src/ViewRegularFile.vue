<template lang="pug">
div
    NTabs(
        type='line'
        v-model:value='tabName'
        @update:value='switchTab'
    )
        NTab(name='viewer') Viewer
        NTab(name='editor') Editor
    div.margin-up-down(
        v-html='mdText'
        v-show=`tabName === 'viewer'`
    )
    div.margin-up-down(
        v-show=`tabName === 'editor'`
        ref='cm'
    )
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Snapshot } from './states';
import { NInput, NCard, NTabs, NTab, } from 'naive-ui';
import MarkdownIt = require('markdown-it');
import markdownItKatex = require('markdown-it-katex');
import hljs from 'highlight.js';
import CodeMirror = require('codemirror/lib/codemirror');
import 'highlight.js/styles/github.css';
import '../katex/katex.min.css';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/lib/codemirror.css';


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
markdownIt.use(markdownItKatex);


export default defineComponent({
    emits: ['update:modelValue'],
    inject: ['state'],
    mounted() {
        const cm = CodeMirror(this.$refs.cm, {
            value: this.state.view,
            mode: "text/markdown",
            indentWithTabs: true,
            lineWrapping: true,
        });
        cm.on('change', () => {
            this.state.view = cm.getValue();
            this.backup();
        });
        this.$data.cm = cm;
    },
    computed: {
        mdText() {
            return markdownIt.render(this.state.view);
        }
    },
    data() {
        return {
            tabName: 'viewer',
        }
    },
    methods: {
        switchTab() {
            Promise.resolve().then(() => this.cm.refresh());
        },
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
