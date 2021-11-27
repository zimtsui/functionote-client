<template lang="pug">
div.margin-up-down(
    v-html='mdText'
)
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import MarkdownIt from 'markdown-it';
import markdownItKatex = require('markdown-it-katex');
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';


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
    computed: {
        mdText() {
            return mdIt.render(this.state.view);
        }
    },
});
</script>
