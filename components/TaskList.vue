<template>
	<v-container>
		<v-row>
			<v-col cols="12">
				<v-select
					v-model="selectedDate"
					:items="availableDates"
					label="Wybierz dzień"
					item-title="label"
					item-value="dateValue"
					no-data-text="Brak zadań. Dodaj nowe." 
				/>
			</v-col>
		</v-row>

		<v-row>
			<v-col cols="12">
				<v-list>
					<h4 class="ml-4 mb-4">Lista zadań</h4>
					<v-list-item v-for="task in filteredTasks" :key="task.id">
						<v-card class="mb-2 d-flex">
							<v-list-item>
								<v-list-item-title>{{ task.title }}</v-list-item-title>
								<v-list-item-subtitle>{{
									task.description || "Brak opisu"
								}}</v-list-item-subtitle>
								<v-list-item-subtitle>{{
									formatDate(task.dueDate)
								}}</v-list-item-subtitle>
							</v-list-item>
							<v-spacer></v-spacer>
							<v-list-item-action>
								<v-btn icon variant="flat" title="Edytuj" :disabled="task.deleting" :to="`/edit/${task.id}`">
									<v-icon>mdi-pencil</v-icon>
								</v-btn>	
								<v-btn icon @click="removeTask(task.id)" variant="flat">
									<v-icon>mdi-delete</v-icon>
								</v-btn>
							</v-list-item-action>
						</v-card>
					</v-list-item>
				</v-list>
			</v-col>
		</v-row>

		<v-row>
			<v-col cols="12">
				<v-card>
					<v-card-title>Dodaj nowe zadanie</v-card-title>
					<v-card-text>
						<v-form ref="form">
							<v-text-field
								v-model="viewModel.title"
								label="Tytuł"
								required
							/>
							<v-textarea v-model="viewModel.description" label="Opis" />
							<v-menu
								v-model="datePicker"
								ref="menu"
								transition="scale-transition"
								offset-y
								full-width
								:close-on-content-click="false"
							>
								<template v-slot:activator="{ props }">
									<v-text-field
										v-model="viewModel.dueDate"
										label="Data"
										v-bind="props"
										readonly
									/>
								</template>
								<v-date-picker
									v-model="viewModel.dueDate"
									@input="datePicker = false"
									hide-header 
								/>
							</v-menu>
						</v-form>
					</v-card-text>
					<v-card-actions>
						<v-btn @click="addTask" color="primary" type="submit" variant="elevated" :loading="loading">Dodaj zadanie</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup>
import dayjs from "dayjs";

const itemsStore = useItemsStore();
const tasks = computed(() => itemsStore.items);

const formatDate = (date) => {
	return dayjs(date).format("YYYY-MM-DD");
};

const availableDates = computed(() => {
	const uniqueDates = [
		...new Set(
			tasks.value.map((task) => dayjs(task.dueDate).format("YYYY-MM-DD"))
		),
	];

	return uniqueDates.map((date) => ({
		label: date,
		dateValue: date,
	}));
});

const selectedDate = ref(
	availableDates.value.length > 0 ? availableDates.value[0].dateValue : ""
);

const filteredTasks = computed(() => {
	return tasks.value.filter(
		(task) => dayjs(task.dueDate).format("YYYY-MM-DD") === selectedDate.value
	);
});

watch(availableDates, (newAvailableDates) => {
	if (newAvailableDates.length > 0) {
		selectedDate.value = newAvailableDates[0].dateValue; // Ustawienie domyślnej daty
	}
});

const viewModel = ref({
	title: "",
	description: "",
	dueDate: null,
});

const datePicker = ref(false);

const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage} = useWebApiResponseParser();

const addTask = async () => {
	console.log("task added");
	await addNewItem();
}

const loading = ref(false);
const errorMsg = ref("");

const addNewItem = async () => {
	loading.value = true;
	const messageMap = {
        "ItemAlreadyExists": "Dane zadanie już istnieje w tym dniu"
    };
	useWebApiFetch('/Item/CreateItem', {
		method: 'POST',
		body: {...viewModel.value},
		onResponseError: ({response}) => {
			errorMsg.value = "Błąd dodawania nowego zadania";
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		}
	})
	.then((response) => {
		if (response.data.value) {
			globalMessageStore.showSuccessMessage('Zadanie zostało dodane');
			itemsStore.loadItems();
		}
	})
	.finally(() => {
		clear();
		loading.value = false;
	});
}

const removeTask = async (taskId) => {
	taskId.deleting = true;
	const messageMap = {
		"ItemNotFound": "Nie znaleziono zadania"
	};

	useWebApiFetch(`/Item/DeleteItem/`, {
		method: 'POST',
		body: {Id:taskId},
		onResponseError: ({ response }) => {
			errorMsg.value = "Błąd usuwania zadania";
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		}
	})
	.then((response) => {
		if (response.data.value) {
			globalMessageStore.showSuccessMessage('Zadanie zostało usunięte');
			itemsStore.loadItems();
		}
	})
	.finally(() => {
		taskId.deleting = false;
	});
}

const clear = () => {
	viewModel.value.title = "";
	viewModel.value.description = "";
	viewModel.value.dueDate = null;
}
</script>