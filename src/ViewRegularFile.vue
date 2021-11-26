<template lang="pug">
div
    NTabs(type='line')
        NTabPane(name='viewer' tab='Viewer')
            div(v-html='mdText')
        NTabPane(name='editor' tab='Editor')
            NInput.margin-up-down(
                type='textarea'
                v-model:value='this.state.view'
                @input='backup'
                :autosize=`{
                    minRows: 10
                }`
            )
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Snapshot } from './states';
import { NInput, NCard, NTabs, NTabPane, } from 'naive-ui';
import MarkdownIt = require('markdown-it');
import markdownItKatex = require('markdown-it-katex');
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';


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
    computed: {
        mdText() {
            return markdownIt.render(this.state.view);
        }
    },
    data() {
        return {
            isEditor: false,
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
        NTabPane,
    }
});
</script>

<style lang="stylus" scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css"
</style>

<style lang="stylus" scoped>
.margin-up-down
    margin-top 5px
.margin-right
    margin-right: 5px
</style>
