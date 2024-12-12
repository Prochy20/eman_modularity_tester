<template>
	<div class="container mx-auto m-10">
		<h1 class="text-3xl tracking-tight uppercase font-black">
			Modularita: Tester emailů
		</h1>
		<div class="flex gap-y-10 flex-col mt-10">
			<UTextarea :rows="10" v-model="input"></UTextarea>
			<UButton @click="parseInput">Parse input</UButton>
			<UButton
				v-if="config.public.API_URL"
				:loading="status === 'pending'"
				@click="downloadData"
				>Download Data</UButton
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

	const input = ref<string>('');

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

	const data = ref<Data[]>([]);
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

	if (config.public.API_URL) {
		await execute({
			dedupe: true,
		});
	}

	const downloadData = async () => {
		if (!config.public.API_URL) {
			return;
		}
		await execute({
			dedupe: true,
		});
		input.value = JSON.stringify(emails.value, null, 2);
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

	/**
	 * Shows the raw output
	 */
	const showRaw = (id: number) => {
		output.value = data.value.find((item) => item.id === id);
	};
</script>
