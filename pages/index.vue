<template>
	<div class="container mx-auto py-5">
		<h1 class="text-3xl tracking-tight uppercase font-black">
			Modularita: Tester emailů
		</h1>
		<div class="mt-2 flex flex-row gap-x-1 items-center text-gray-400">
			<UIcon name="i-lucide-server" />
			<small class="small">
				{{ config.public.API_URL }}
			</small>
		</div>
		<div class="flex gap-y-3 flex-col mt-3">
			<div class="ml-auto flex flex-row gap-x-2 items-center">
				<p>Zobrazit vstupní pole:</p>
				<UToggle
					on-icon="i-heroicons-check-20-solid"
					off-icon="i-heroicons-x-mark-20-solid"
					v-model="showInput"
				/>
			</div>
			<UTextarea v-if="showInput" :rows="10" v-model="input"></UTextarea>
		</div>
		<div class="flex flex-row mt-10 gap-x-5 items-center justify-center">
			<UButton
				v-if="showInput"
				:disabled="!input"
				icon="i-lucide-binoculars"
				@click="parseInput"
				>Parse input</UButton
			>
			<UButton
				v-if="config.public.API_URL"
				icon="i-lucide-download"
				:loading="status === 'pending'"
				@click="downloadData"
				>Download Data & Parse input</UButton
			>
		</div>
		<div class="mt-10">
			<UTable :rows="data" :columns="columns">
				<template #attachment-data="{ row }">
					<div class="flex flex-row gap-x-2">
						<form
							:action="`/api/pdf`"
							method="post"
							v-if="row.attachment"
						>
							<input
								type="hidden"
								name="pdf"
								:value="row.attachment"
							/>
							<UButton type="submit">Zobrazit</UButton>
						</form>

						<UButton v-if="row.attachment" @click="showRaw(row.id)"
							>Zobrazit raw</UButton
						>
					</div>
				</template>
			</UTable>
		</div>
		<h2 class="mt-10 text-2xl" v-if="output">Raw output:</h2>
		<pre>
            {{ output }}
        </pre>

		<h2 class="mt-10 text-2xl mb-1" v-if="output">Base64 attachment:</h2>

		<div v-if="output && output.attachment_raw">
			<div v-for="attachment in output.attachment_raw">
				<UTextarea :rows="20" v-model="attachment.content" />
			</div>
		</div>
	</div>
</template>
<script lang="ts" setup>
	import type { EmailInput, Data } from '~/types/input.type';

	/**
	 * Datagrid columns
	 */
	const columns = [
		{
			key: 'from',
			label: 'FROM',
		},
		{
			key: 'to',
			label: 'TO',
		},
		{
			key: 'subject',
			label: 'SUBJECT',
		},
		{
			key: 'attachment',
			label: 'ATTACHMENTS',
		},
		{
			key: 'body',
			label: 'BODY',
		},
	];

	/**
	 * Data
	 */
	const data = ref<Data[]>([]);
	const input = ref<string>('');
	const output = ref<any>();

	/**
	 * Fetches emails from the API
	 */
	const config = useRuntimeConfig();

	const {
		data: emails,
		execute,
		status,
	} = await useFetch<EmailInput[]>('/api/emails', {
		immediate: false,
	});

	/**
	 * Downloads the data from the API
	 */
	const downloadData = async () => {
		if (!config.public.API_URL) {
			return;
		}
		await execute({
			dedupe: true,
		});
		input.value = JSON.stringify(emails.value, null, 2);
		parseInput();
	};

	/**
	 * Parses the input and sets the data
	 */
	const parseInput = () => {
		const parsedInput: EmailInput[] = JSON.parse(input.value);
		data.value = parsedInput.map((email, index) => ({
			from: email.from.email,
			to: email.personalizations
				.map((item) => item.to.shift()?.email)
				.join(', '),
			subject: email.subject,
			attachment_raw: email.attachments,
			attachment: email.attachments ? email.attachments[0].content : '',
			body: email.content.shift()?.value || '',
			id: index,
		}));
	};

	if (config.public.API_URL) {
		await downloadData();
	}

	/**
	 * Shows the raw output
	 */
	const showRaw = (id: number) => {
		output.value = data.value.find((item) => item.id === id);
	};

	const showInput = ref<boolean>(true);
</script>
