import { defineStore } from "pinia";
import dayjs from "dayjs";

export const useItemsStore = defineStore({
	id: "items-store",

	state: () => {
		return {
			items: [],
			loading: false,
			todayNotificationCount: 0,
		};
	},

	actions: {
		loadItems() {
			this.loading = true;
			return useWebApiFetch("/Item/GetAllItems")
				.then(({ data, error }) => {
					if (data.value) {
						this.items = data.value.toDoItems;
						const today = dayjs().format("YYYY-MM-DD");
						this.todayNotificationCount = this.items.filter(item => {
							const dueDate = dayjs(item.dueDate).format("YYYY-MM-DD");
							return dueDate === today;
						}).length;
						
					} else if (error.value) {
						console.log("Błąd podczas pobierania zadań");
					}
				})
				.finally(() => {
					this.checkUpcomingItems();
					this.loading = false;
				}) 
		},
		checkUpcomingItems()  {
			const globalMessageStore = useGlobalMessageStore();
			if (this.todayNotificationCount > 0) {
				globalMessageStore.showWarningMessage(
					`Liczba zadań do wykonania na dziś: ${this.todayNotificationCount}`
				);
			} else {
				globalMessageStore.showSuccessMessage(
					"Brak przypisanych zadań na dziś. Przypisz nowe lub ciesz się dobrze wykonaną pracą :)"
				);
			}
		}
	},
});