<template>
	<v-app id="inspire">
		<v-app-bar>
			<v-app-bar-title>Aplikacja do planowania zadań</v-app-bar-title>
			<v-spacer></v-spacer>
			<v-badge
				color="red"
				:content="itemsStore.todayNotificationCount"
				v-if="itemsStore.todayNotificationCount > 0"
				class = "mr-4"
			>
				<v-btn
					icon="mdi-bell"
					title="Powiadomienia"
					@click="itemsStore.checkUpcomingItems"
				></v-btn>
			</v-badge>
			<VBtn
				icon="mdi-theme-light-dark"
				title="Przełącz motyw"
				@click="toggleTheme"
			></VBtn>
		</v-app-bar>

		<v-main>
			<div class="pa-4">
				<NuxtPage />
			</div>
		</v-main>
	</v-app>
</template>

<script setup>
import { useTheme } from "vuetify";
const theme = useTheme();
const itemsStore = useItemsStore();



function toggleTheme() {
	theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
}

onMounted(async () => {
	await itemsStore.loadItems();
});
</script>
