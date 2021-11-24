<template lang="pug">
div
    div
        p content
    textarea(v-model='this.state.view')
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { State } from './states';

export default defineComponent({
    emits: ['update:modelValue'],
    inject: ['state'],
});
</script>
