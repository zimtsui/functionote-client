<template lang="pug">
div
    ul
        li.margin-up-down.break-word(text)(
            v-for='item in list'
            @click=`$emit('downwards', item.name)`
        ) {{item.type === '-' ? '📝' : '📁'}} {{item.name}}
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { NButton } from 'naive-ui';

export default defineComponent({
    inject: ['state'],
    computed: {
        list() {
            return this.state.view;
        }
    },
    components: {
        NButton,
    }
});
</script>

<style lang="stylus" scoped>
.margin-up-down
    margin-top 15px
.break-word
    word-wrap break-word
</style>
