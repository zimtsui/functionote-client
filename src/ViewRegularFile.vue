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
        PrismEditor.my-editor(
            v-model='this.state.view'
            tab-size=4
            :highlight='(x=>x)'
            @input='backup'
        )
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Snapshot } from './states';
import { NInput, NCard, NTabs, NTab, } from 'naive-ui';
import MarkdownIt from 'markdown-it';
import markdownItKatex = require('markdown-it-katex');
import '../katex-0.6.0/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';


const mdIt = new MarkdownIt({
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
mdIt.use(markdownItKatex);


export default defineComponent({
    inject: ['state'],
    mounted() {
    },
    computed: {
        mdText() {
            return mdIt.render(this.state.view);
        }
    },
    data() {
        return {
            tabName: 'viewer',
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
        PrismEditor,
    }
});
</script>

<style lang="stylus" scoped>
.margin-up-down
    margin-top 5px
.margin-right
    margin-right 5px

.my-editor
    font-family Fira code, Fira Mono, Consolas, Menlo, Courier, monospace
    font-size 14px
    line-height 1.5
    padding 5px
</style>

<style lang="stylus">
.prism-editor__textarea
    outline none
</style>
