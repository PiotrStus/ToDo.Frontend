<template>
	<VCard>
		<v-toolbar color="transparent">
			<template v-slot:prepend>
				<v-btn icon="mdi-chevron-left" to="/"></v-btn>
			</template>
			<v-toolbar-title> Edycja zadania </v-toolbar-title>
		</v-toolbar>
		<VSkeletonLoader v-if="loading" type="paragraph, actions"></VSkeletonLoader>
		<VForm v-else @submit.prevent="submit" :disabled="saving">
			<VCardText>
				<v-text-field
					variant="outlined"
					v-model="viewModel.title"
					label="Nazwa zadania"
					class="mb-2"
				/>
				<v-text-field
					variant="outlined"
					v-model="viewModel.description"
					label="Opis zadania"
					class="mb-2"
				/>
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
						hide-header
					/>
				</v-menu>
			</VCardText>
			<VCardText class="text-right">
				<VBtn
					prepend-icon="mdi-content-save"
					variant="flat"
					color="primary"
					type="submit"
					:loading="saving"
					:disabled="loading"
				>
					Zapisz
				</VBtn>
			</VCardText>
		</VForm>
	</VCard>
</template>

<script setup>
const globalMessageStore = useGlobalMessageStore();
const itemsStore = useItemsStore();
const { getErrorMessage } = useWebApiResponseParser();
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const datePicker = ref(false);


const viewModel = ref({
	title: "",
	description: "",
	dueDate: null,
});

const submit = async (ev) => {
	const { valid } = await ev;
	if (valid) {
		save();
	}
};

const save = () => {
	saving.value = true;
	const messageMap = {
		ItemNotFound: "Nie znaleziono takiego zadania",
		ItemAlreadyExist: "Zadanie o podanym tytule już istnieje w tym dniu",
	};

	const idAsNumber = Number(route.params.id);

	if (isNaN(idAsNumber)) {
		globalMessageStore.showErrorMessage("Wprowadzono niewłaściwy ID zadania.");
		saving.value = false;
		return;
	}

	useWebApiFetch("/Item/UpdateItem", {
		method: "POST",
		body: {
			id: idAsNumber,
			title: viewModel.value.title,
			description: viewModel.value.description,
			dueDate: viewModel.value.dueDate,
		},
		watch: false,
		onResponseError: ({ response }) => {
			let message = getErrorMessage(response, messageMap);
			globalMessageStore.showErrorMessage(message);
		},
	})
		.then((response) => {
			if (response.data.value) {
				globalMessageStore.showSuccessMessage("Zapisano zmiany.");
				router.push({ path: "/" });
				itemsStore.loadItems();
			}
		})
		.finally(() => {
			saving.value = false;
		});
};

watch(() => viewModel.value.dueDate, () => console.log(viewModel.value.dueDate));

const parseDate = (dateString) => {
	if (dateString) {
		const date = new Date(dateString);
		return !isNaN(date.getTime()) ? date : null;
	}
	return null;
};

const loadData = () => {
	loading.value = true;

	useWebApiFetch("/Item/GetItem", {
		query: { id: route.params.id },
	})
		.then(({ data, error }) => {
			if (data.value) {
				//viewModel.value = data.value;
				viewModel.value.id = data.value.id;
				viewModel.value.title = data.value.title;
				viewModel.value.description = data.value.description;
				//viewModel.value.dueDate = new Date(viewModel.value.date);
				viewModel.value.dueDate = parseDate(viewModel.value.date);
				console.log(viewModel.value);
				console.log(viewModel.value.dueDate);
				console.log(typeof viewModel.value.dueDate);
			} else if (error.value) {
				globalMessageStore.showErrorMessage("Błąd pobierania danych");
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

onMounted(async () => {
	await loadData();
});
</script>
