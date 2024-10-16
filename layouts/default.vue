<template>
	<v-app id="inspire">
	  <v-app-bar>
		<v-app-bar-title>Todo Application</v-app-bar-title>
		<v-spacer></v-spacer>
		<VBtn icon="mdi-theme-light-dark" title="Przełącz motyw" @click="toggleTheme"></VBtn>
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


function toggleTheme () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

onMounted( () => 
{
	itemsStore.loadItems();
})

</script>
