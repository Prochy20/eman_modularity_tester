<template>
	<div class="container mx-auto m-10">
		<h1 class="text-3xl tracking-tight uppercase font-black">
			Modularita: Tester emailů
		</h1>
		<div class="flex gap-y-10 flex-col mt-10">
			<UTextarea :rows="20" v-model="input"></UTextarea>
			<UButton @click="parseInput">Submit</UButton>
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
	import type { EmailInput } from '~/types/input.type';

	interface Data {
		id: number;
		from: string;
		to: string;
		subject: string;
		attachment?: string;
		body: string;
	}

	const input = ref<string>('');
	// const output = ref<string>('');

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
			body: email.content.shift()?.value,
			id: index,
		}));
	};

	const showRaw = (id: number) => {
		output.value = data.value.find((item) => item.id === id);
	};
</script>
