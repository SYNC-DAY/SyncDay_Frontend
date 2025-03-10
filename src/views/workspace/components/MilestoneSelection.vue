<!-- MilestoneSelectionModal.vue -->
<template>
	<Dialog v-model:visible="isVisible" :modal="true" :closable="true" header="Select GitHub Milestone"
		:style="{ width: '80vw', maxWidth: '900px' }" :closeOnEscape="true" @hide="$emit('close')">
		<div class="grid grid-cols-2 gap-4">
			<!-- Milestones List -->
			<div class="border rounded-lg p-4">
				<h3 class="font-medium mb-4">Milestones</h3>
				<div class="space-y-2">
					<div v-for="milestone in milestones" :key="milestone.id" @click="handleMilestoneClick(milestone)"
						:class="[
							'p-3 rounded-lg cursor-pointer hover:bg-gray-100',
							selectedMilestone?.id === milestone.id ? 'bg-gray-100' : ''
						]">
						<div class="flex items-center justify-between">
							<h4 class="font-medium">{{ milestone.title }}</h4>
							<div v-if="milestone.due_on" class="flex items-center text-sm text-gray-500">
								<i class="pi pi-calendar mr-1" />
								{{ new Date(milestone.due_on).toLocaleDateString() }}
							</div>
						</div>
						<ProgressBar :value="milestone.progress_percentage" class="mt-2" />
						<div class="text-sm text-gray-500 mt-1">
							{{ milestone.open_issues }} open / {{ milestone.total_issues }} total issues
						</div>
					</div>
				</div>
			</div>

			<!-- Issues List -->
			<div class="border rounded-lg p-4">
				<h3 class="font-medium mb-4">Milestone Issues</h3>
				<div class="space-y-2">
					<div v-for="issue in milestoneIssues" :key="issue.id" class="p-3 rounded-lg border">
						<div class="flex items-center gap-2">
							<i :class="[
								'pi',
								issue.state === 'closed' ? 'pi-check-circle text-green-500' : 'pi-exclamation-circle text-yellow-500'
							]" />
							<span>{{ issue.title }}</span>
						</div>
						<div v-if="issue.assignees.length" class="text-sm text-gray-500 mt-1">
							Assigned to: {{ issue.assignees.join(', ') }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<template #footer>
			<div class="flex justify-end gap-2">
				<Button label="Cancel" class="p-button-outlined" :disabled="isLoading" @click="$emit('close')" />
				<Button label="Convert to Cardboard" :loading="isLoading" :disabled="!selectedMilestone || isLoading"
					@click="handleSave" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
	import { ref, computed, watch, inject } from 'vue';
	import { useGithubMilestoneStore } from '@/stores/github/useGithubMilestoneStore';
	import { useGithubIssueStore } from '@/stores/github/useGithubIssueStore';
	import { useCardboardStore } from '@/stores/proj/useCardboardStore';
	import Dialog from 'primevue/dialog';
	import Button from 'primevue/button';
	import ProgressBar from 'primevue/progressbar';
	import { useAuthStore } from '@/stores/auth';

	const authStore = useAuthStore();
	const props = defineProps({
		isOpen: {
			type: Boolean,
			required: true
		},
		installationId: {
			type: Number,
			required: false
		},
		repoUrl: {
			type: String,
			required: false
		},
		projectId: {
			type: String,
			required: true
		},
		workspaceId: {
			type: [Number, String],
			required: true
		}

	});

	const emit = defineEmits(['close']);

	// Store instances
	const milestoneStore = useGithubMilestoneStore();
	const issueStore = useGithubIssueStore();
	const cardboardStore = useCardboardStore();

	// Component state
	const selectedMilestone = ref(null);
	const milestoneIssues = ref([]);
	const isLoading = ref(false);
	const milestones = ref([])
	// Computed properties
	const isVisible = computed({
		get: () => props.isOpen,
		set: (value) => {
			if (!value) emit('close');
		}
	});

	// const milestones = computed(() =>
	// 	// milestoneStore.getMilestones(props.installationId, repositoryInfo.owner, repositoryInfo.repoName)
	// );
	const owner = ref(null)
	const repo = ref(null)
	// Watch for modal open state
	watch(() => props.isOpen, async (newValue) => {
		if (newValue) {
			await fetchMilestones();
			if (!props.installationId) {
				throw new Error("installationId가 없습니다")
			}
		} else {
			// Reset state when modal closes
			selectedMilestone.value = null;
			milestoneIssues.value = [];
		}
	});

	// Methods
	const fetchMilestones = async () => {
		isLoading.value = true;
		console.log(props.installationId)
		if (!props.installationId) {
			throw new Error("no installationId found")
		}
		// console.log(props.repoUrl)
		if (props.repoUrl) {
			owner.value = props.repoUrl.split('/')[3]
			repo.value = props.repoUrl.split('/')[4]
		}
		try {
			milestones.value = await milestoneStore.fetchMilestones(
				props.installationId,
				owner,
				repo
			);
		} catch (error) {
			console.error('Failed to fetch milestones:', error);
		} finally {
			isLoading.value = false;
		}
	};

	const handleMilestoneClick = async (milestone) => {
		selectedMilestone.value = milestone;
		isLoading.value = true;

		try {
			milestoneIssues.value = await issueStore.fetchIssuesByMilestone(
				props.installationId,
				owner,
				repo,
				milestone.number
			);

		} catch (error) {
			console.error('Failed to fetch milestone issues:', error);
		} finally {
			isLoading.value = false;
		}
	};

	const handleSave = async () => {
		if (!selectedMilestone.value || !milestoneIssues.value.length) return;

		try {
			isLoading.value = true;

			const request = {
				project_id: props.projectId,
				workspace_id: props.workspaceId,
				title: selectedMilestone.value.title,
				due_date: selectedMilestone.value.due_on,
				progress_status: selectedMilestone.value.progress_percentage,
				vcs_type: 'GITHUB',
				cards: milestoneIssues.value.map(issue => ({
					user_id: authStore.user.userId,
					title: issue.title,
					content: issue.body,
					status: issue.state === 'OPEN' ? 'TODO' : 'DONE',
					created_at: issue.createdAt,
					updated_at: issue.updatedAt,
					assignee: issue.assignees[0].login,
					assignee_avatar: issue.assignees[0].avatarUrl,
					vcs_object_type: "ISSUE",
					vcs_object_url: issue.url,
				}))
			};

			await cardboardStore.createCardboardWithCards(request);
			emit('close');
		} catch (error) {
			console.error('Failed to convert milestone to cardboard:', error);
		} finally {
			isLoading.value = false;
		}
	};
</script>

<style scoped>
	:deep(.p-dialog-header) {
		padding: 1.5rem;
	}

	:deep(.p-dialog-content) {
		padding: 0 1.5rem 1.5rem 1.5rem;
	}

	:deep(.p-dialog-footer) {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
	}
</style>