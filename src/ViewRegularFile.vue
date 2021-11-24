<template lang="pug">
div
    div
        p content
    textarea(
        v-model='this.state.view'
        @input='backup'
    )
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { State, Snapshot } from './states';


export default defineComponent({
    emits: ['update:modelValue'],
    inject: ['state'],
    methods: {
        backup() {
            const snapshot: Snapshot = {
                branch: this.state.branch,
                root: this.state.root,
                filePathArray: this.state.filePathArray,
                text: this.state.view,
            };
            localStorage.setItem('backup', JSON.stringify(snapshot));
        }
    },
});
</script>
