<script setup lang="ts">
import { ref } from 'vue';

export interface DetailControlOptions {
  showComments: boolean;
  showImports: boolean;
  showPrivateMembers: boolean;
  showMethodBodies: boolean;
  showParameterTypes: boolean;
  showParameters: boolean;
  abbreviateTypes: boolean;
  onlyPublic: boolean;
}

const options = ref<DetailControlOptions>({
  showComments: true,
  showImports: true,
  showPrivateMembers: true,
  showMethodBodies: true,
  showParameterTypes: true,
  showParameters: true,
  abbreviateTypes: false,
  onlyPublic: false,
});

const emit = defineEmits<{
  change: [options: DetailControlOptions]
}>();

const presets = {
  full: {
    name: 'Full Detail',
    options: {
      showComments: true,
      showImports: true,
      showPrivateMembers: true,
      showMethodBodies: true,
      showParameterTypes: true,
      showParameters: true,
      abbreviateTypes: false,
      onlyPublic: false,
    }
  },
  noComments: {
    name: 'No Comments',
    options: {
      showComments: false,
      showImports: true,
      showPrivateMembers: true,
      showMethodBodies: true,
      showParameterTypes: true,
      showParameters: true,
      abbreviateTypes: false,
      onlyPublic: false,
    }
  },
  signaturesOnly: {
    name: 'Signatures Only',
    options: {
      showComments: false,
      showImports: false,
      showPrivateMembers: true,
      showMethodBodies: false,
      showParameterTypes: true,
      showParameters: true,
      abbreviateTypes: false,
      onlyPublic: false,
    }
  },
  publicOnly: {
    name: 'Public Only',
    options: {
      showComments: false,
      showImports: false,
      showPrivateMembers: false,
      showMethodBodies: false,
      showParameterTypes: true,
      showParameters: true,
      abbreviateTypes: false,
      onlyPublic: true,
    }
  },
  minimal: {
    name: 'Minimal',
    options: {
      showComments: false,
      showImports: false,
      showPrivateMembers: false,
      showMethodBodies: false,
      showParameterTypes: false,
      showParameters: false,
      abbreviateTypes: false,
      onlyPublic: true,
    }
  }
};

const emitChange = () => {
  emit('change', { ...options.value });
};

const applyPreset = (presetKey: keyof typeof presets) => {
  options.value = { ...presets[presetKey].options };
  emitChange();
};
</script>

<template>
  <div class="detail-control-panel">
    <h6 class="mb-3">
      <i class="bi bi-sliders me-2"></i>
      Detail Level
    </h6>

    <!-- Presets -->
    <div class="mb-3">
      <label class="form-label small fw-semibold">Presets</label>
      <div class="btn-group-vertical d-grid gap-1" role="group">
        <button
          v-for="(preset, key) in presets"
          :key="key"
          type="button"
          class="btn btn-sm btn-outline-primary text-start"
          @click="applyPreset(key as keyof typeof presets)"
        >
          {{ preset.name }}
        </button>
      </div>
    </div>

    <!-- Custom Options -->
    <div class="custom-options">
      <label class="form-label small fw-semibold">Custom</label>
      
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="showComments"
          v-model="options.showComments"
          @change="emitChange"
        >
        <label class="form-check-label small" for="showComments">
          Show Comments
        </label>
      </div>

      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="showImports"
          v-model="options.showImports"
          @change="emitChange"
        >
        <label class="form-check-label small" for="showImports">
          Show Imports
        </label>
      </div>

      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="showPrivateMembers"
          v-model="options.showPrivateMembers"
          @change="emitChange"
        >
        <label class="form-check-label small" for="showPrivateMembers">
          Show Private Members
        </label>
      </div>

      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="showMethodBodies"
          v-model="options.showMethodBodies"
          @change="emitChange"
        >
        <label class="form-check-label small" for="showMethodBodies">
          Show Method Bodies
        </label>
      </div>

      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="showParameters"
          v-model="options.showParameters"
          @change="emitChange"
        >
        <label class="form-check-label small" for="showParameters">
          Show Parameters
        </label>
      </div>

      <div class="form-check form-switch" v-if="options.showParameters">
        <input
          class="form-check-input"
          type="checkbox"
          id="showParameterTypes"
          v-model="options.showParameterTypes"
          @change="emitChange"
        >
        <label class="form-check-label small" for="showParameterTypes">
          Show Parameter Types
        </label>
      </div>

      <div class="form-check form-switch" v-if="options.showParameterTypes">
        <input
          class="form-check-input"
          type="checkbox"
          id="abbreviateTypes"
          v-model="options.abbreviateTypes"
          @change="emitChange"
        >
        <label class="form-check-label small" for="abbreviateTypes">
          Abbreviate Types
        </label>
      </div>

      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="onlyPublic"
          v-model="options.onlyPublic"
          @change="emitChange"
        >
        <label class="form-check-label small" for="onlyPublic">
          Public Members Only
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-control-panel {
  padding: 1rem;
  font-size: 0.875rem;
}

.custom-options {
  max-height: 400px;
  overflow-y: auto;
}

.form-check {
  padding-left: 2.5rem;
  margin-bottom: 0.5rem;
}

.form-check-input {
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  user-select: none;
}

.btn-group-vertical .btn {
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
}
</style>
