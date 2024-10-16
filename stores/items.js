import { defineStore } from "pinia";

export const useItemsStore = defineStore({
	id: "items-store",

	state: () => {
		return {
			items: [],
			loading: false
		};
	},

	actions: {
		loadItems() {
			this.loading = true;
			return useWebApiFetch("/Item/GetAllItems")
				.then(({ data, error }) => {
					if (data.value) {
						console.log(data.value);
						this.items = data.value.toDoItems;
						console.log(this.items);
					} else if (error.value) {
						console.log("Brak zadań");
					}
				})
				.finally(() => {
					this.loading = false;
				}) 
		},
	},
});