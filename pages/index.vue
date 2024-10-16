<template>
	<VSkeletonLoader v-if="itemsStore.$state.loading" type="article"></VSkeletonLoader>
	<TaskList v-else/>
</template>



<script setup>
const itemsStore = useItemsStore();

</script>