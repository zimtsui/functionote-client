<template lang="pug">
div
    ul
        li(
            v-for='item in list'
            @click=`$emit('downwards', item.name)`
        ) {{item}}
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { DirectoryFnodeView } from './interfaces';

export default defineComponent({
    inject: ['state'],
    computed: {
        list() {
            return this.state.view;
        }
    },
});
</script>
