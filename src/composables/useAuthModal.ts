import { ref } from 'vue';

const isAuthModalOpen = ref(false);
let modalResolver: ((result: boolean) => void) | null = null;

function finishAuthModal(result: boolean) {
  if (modalResolver) {
    modalResolver(result);
    modalResolver = null;
  }

  isAuthModalOpen.value = false;
}

export function useAuthModal() {
  async function openAuthModal() {
    isAuthModalOpen.value = true;

    return new Promise<boolean>((resolve) => {
      modalResolver = resolve;
    });
  }

  function closeAuthModal() {
    finishAuthModal(false);
  }

  function resolveAuthModal() {
    finishAuthModal(true);
  }

  return {
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    resolveAuthModal,
  };
}
