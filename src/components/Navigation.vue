<template>
	<nav class="nav-top container-row underline-gray">
		<!-- logo -->
		<div class="nav-logo">
			<RouterLink to="/">
				<span>SYNCDAY</span>
			</RouterLink>
		</div>

		<!-- tabs -->
		<div class="nav-tabs container-row">
			<ul>
				<li>
					<RouterLink to="/calendar" class="nav-link" :class="{ 'active': isRouteActive('calendar') }">
						<span>
							캘린더
						</span>
						<div class="underbar gradient-horizontal"></div>
					</RouterLink>
				</li>

				<li>
					<RouterLink to="/team" class="nav-link" :class="{ 'active': isRouteActive('team') }">
						<span>
							팀
						</span>
						<div class="underbar gradient-horizontal"></div>
					</RouterLink>
				</li>

				<li>
					<RouterLink to="/project" class="nav-link" :class="{ 'active': isRouteActive('project') }">
						<span>프로젝트</span>
						<div class="underbar gradient-horizontal"></div>
					</RouterLink>
				</li>
			</ul>
		</div>

		<!-- search -->
		<div class="nav-search">
			<div class="p-input-icon-right">
				<i class="pi pi-search cursor-pointer" @click="handleSearch"></i>
				<InputText v-model="searchText" placeholder="검색어를 입력하세요" @keyup.enter="handleSearch" />
			</div>
		</div>

		<!-- icon,profile -->
		<div class="nav-right flex-row">
			<!-- icons -->
			<div class="icons">
				<RouterLink to="/meetingroom">
					<i class="pi pi-users"></i>
				</RouterLink>
				<button class="icon-button" @click="toggleChatPop">
					<i class="pi pi-send"></i>
				</button>
				<RouterLink to="/invitation">
					<i class="pi pi-envelope"></i>
				</RouterLink>
			</div>

			<!-- profile -->
			<div class="profile" @click="toggleDropdown" ref="profileRef">
				<div class="profile-image-container">
					<RouterLink to="/mypage">
						<img :src="authStore.user.profilePhoto || '/default-avatar.png'" alt="User Profile"
							class="profile-image" />
					</RouterLink>
				</div>
				<div class="user-menu">
					<span class="user-name">{{ authStore.user.userName }}님 ▼</span>
					<!-- 드롭다운 메뉴 -->
					<div v-show="isDropdownOpen" class="dropdown-menu">
						<RouterLink to="/mypage" class="dropdown-item">마이페이지</RouterLink>
						<button @click="handleLogout" class="dropdown-item">로그아웃</button>
					</div>
				</div>
			</div>

		</div>
		<ChatPop :key="isPopupVisible" :isVisible="isPopupVisible" @update:isVisible="isPopupVisible = $event"
			@closePopup="closePopup" />
	</nav>
</template>

<script setup>
	import { RouterLink, useRouter, useRoute } from 'vue-router';
	import { useAuthStore } from '@/stores/auth.js';
	import { ref, onMounted, onUnmounted, computed } from 'vue';
	import InputText from 'primevue/inputtext';
	import ChatPop from '@/views/chat/ChatRoomList.vue';
	import Swal from 'sweetalert2';

	const router = useRouter();
	const route = useRoute();
	const isDropdownOpen = ref(false);
	const profileRef = ref(null);
	const authStore = useAuthStore();
	const isPopupVisible = ref(false);
	const searchText = ref(''); // 초기값을 빈 문자열로 변경

	// 검색 처리 함수 수정
	const handleSearch = () => {
		const trimmedSearch = searchText.value.trim();

		if (trimmedSearch.length === 0) {
			return;
		}

		if (trimmedSearch.length === 1) {
			Swal.fire({
				icon: 'warning',
				title: '검색어가 너무 짧습니다',
				text: '최소 2글자 이상 입력해주세요.',
				confirmButtonText: '확인',
				confirmButtonColor: '#15B8A6',  // SYNCDAY의 핑크색 테마
				heightAuto: false,        // 높이 자동조절 비활성화
				scrollbarPadding: false

			});
			return;
		}

		console.log("검색된 단어: ", trimmedSearch);
		router.push({
			path: '/search',
			query: {
				keyword: trimmedSearch
			}
		});
	};

	// 드롭다운 토글
	const toggleDropdown = () => {
		isDropdownOpen.value = !isDropdownOpen.value;
	};

	// 채팅 팝업
	const toggleChatPop = () => {
		isPopupVisible.value = !isPopupVisible.value;
	};

	// 드롭다운 외부 클릭 시 닫기
	const handleClickOutside = (event) => {
		if (profileRef.value && !profileRef.value.contains(event.target)) {
			isDropdownOpen.value = false;
		}
	};

	// 로그아웃 처리
	const handleLogout = async () => {
		try {
			await authStore.logout();
			router.push('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	const closePopup = () => {
		isPopupVisible.value = false;
	}

	onMounted(() => {
		isPopupVisible.value = false;
	});

	onMounted(() => {
		document.addEventListener('click', handleClickOutside);
	});

	onUnmounted(() => {
		document.removeEventListener('click', handleClickOutside);
	});

	const isRouteActive = (routeName) => {
		return route.path.includes(`/${routeName}`);
	};
</script>

<style scoped>
	.nav-top {
		padding: 0.5rem;
	}

	.nav-top>div,
	.nav-top ul,
	.icons {
		height: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
	}

	.nav-top ul {
		width: 100%;
	}

	/* 로고 영역 */
	.nav-logo {
		flex: 0 0 auto;
		/* 고정 크기 */
		font-weight: 700;
	}

	.nav-logo span {
		font-size: 2rem;
	}

	.nav-tabs {
		flex: 1;
		/* 축소는 가능하지만 늘어나지는 않음 */
		min-width: 15rem;
		/* 최소 너비 설정 */
	}


	.nav-tabs ul {
		width: 100%;
		justify-content: space-around;
		height: auto;
	}

	.nav-link {
		text-decoration: none;
		font-size: 1.5rem;
		padding: 1rem 1rem;
		position: relative;
		display: inline-block;
		z-index: 1;
	}

	/* 언더바 스타일 수정 */
	.underbar {
		position: absolute;
		bottom: 0.5rem;
		/* 위치를 아래쪽으로 조정 */
		left: 0;
		width: 0;
		height: 0.5rem;
		/* 높이를 줄임 */
		border-radius: 0.2rem;
		transition: width 0.3s ease;
		/* opacity: 0.3; */
		/* 불투명도 추가 */
		z-index: -1;
		/* 텍스트 뒤로 보내기 */
	}

	.nav-link.active .underbar {
		width: 100%;
	}

	.nav-tabs li {
		position: relative;
		height: auto;
	}

	.nav-search {
		flex: 1 1 auto;
		/* 남은 공간을 최대한 차지 */
		padding: 0.5rem;
	}

	.nav-search .p-input-icon-right {
		width: 100%;
		max-width: 25rem;
		position: relative;
	}

	.nav-search .p-input-icon-right i {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		right: 1rem;
		color: #6c757d;
		/* 아이콘 색상을 원하는 대로 조정하세요 */
	}

	.nav-search .p-input-icon-right input {
		width: 100%;
		height: 2.4rem;
		font-size: 1rem;
		border-radius: 1.2rem;
		padding: 0 2.5rem 0 1rem;
		/* 오른쪽 패딩을 늘려서 아이콘 공간 확보 */
		z-index: 1;
		/* 클릭 가능하도록 z-index 설정 */
	}

	.p-input-icon-right i:hover {
		cursor: pointer;
		color: #495057;
	}

	/* 우측 아이콘/프로필 영역 */
	.nav-right {
		flex: 0 0 auto;
		/* 고정 크기 */
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.icons {
		display: flex;
		gap: 1rem;
		/* 아이콘 간 간격 */
		align-items: center;
	}

	.icons img {
		height: 1.5rem;
	}

	.icon-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.icon-button i {
		height: 1rem;
	}

	.profile {
		flex: 1;
		width: 4rem;
		height: 4rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.profile-image-container {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: 0.25rem;
	}

	.profile-image {
		width: 3rem;
		height: 3rem;
		object-fit: cover;
	}

	.user-menu {
		position: relative;
	}

	.user-name {
		font-size: 0.8rem;
		text-align: center;
		color: black;
		cursor: pointer;
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		background: white;
		border: 1px solid var(--outline-gray);
		border-radius: 0.5rem;
		padding: 0.5rem;
		z-index: 1000;
	}

	.dropdown-item {
		display: block;
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: black;
		white-space: nowrap;
		cursor: pointer;
		border: none;
		background: none;
		width: 100%;
		text-align: left;
		font-size: 1rem;
	}

	.dropdown-item:hover {
		background-color: var(--outline-gray);
	}
</style>