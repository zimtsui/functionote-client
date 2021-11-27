<template lang="pug">
div
    NTabs(
        type='line'
        v-model:value='tabName'
    )
        NTabPane(name='viewer' tab='Viewer')
            RegularFileViewer
        NTabPane(name='editor' tab='Editor')
            RegularFileEditor
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { NTabs, NTabPane, } from 'naive-ui';
import RegularFileViewer from './RegularFileViewer.vue';
import RegularFileEditor from './RegularFileEditor.vue';



export default defineComponent({
    inject: ['state'],
    components: {
        NTabs,
        NTabPane,
        RegularFileEditor,
        RegularFileViewer,
    }
});
</script>

<style lang="stylus" scoped>
.margin-up-down
    margin-top 5px
</style>
