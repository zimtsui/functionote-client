<template lang="pug">
div
    prism-editor.my-editor(
        v-model='this.state.view'
        :tab-size='1'
        :insert-spaces='false'
        :highlight='(x=>x)'
        @input='backup'
    )
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Snapshot } from './states';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';


export default defineComponent({
    inject: ['state'],
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
        PrismEditor,
    }
});
</script>

<style lang="stylus" scoped>
.my-editor
    font-family monospace
    line-height 1.5
    tab-size 4
</style>

<style lang="stylus">
.prism-editor__textarea
    outline none
</style>
