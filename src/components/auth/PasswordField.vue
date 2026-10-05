<script setup>
import { ref } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'

const model = defineModel({ type: String, default: '' })

defineProps({
  id: { type: String, required: true },
  autocomplete: { type: String, default: 'current-password' },
  invalid: { type: Boolean, default: false },
})

const visible = ref(false)
</script>

<template>
  <div class="pw" :class="{ invalid }">
    <BaseIcon name="lock" :size="18" class="lead" />
    <input
      :id="id"
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :autocomplete="autocomplete"
      :aria-invalid="invalid"
      dir="ltr"
    />
    <button type="button" :aria-label="visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'" @click="visible = !visible">
      <BaseIcon :name="visible ? 'eye-off' : 'eye'" :size="18" />
    </button>
  </div>
</template>

<style scoped>
.pw {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  background: var(--bg);
  border-radius: 10px;
  padding-inline: 12px 6px;
}
.pw:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
.pw.invalid {
  border-color: var(--rose);
}
.lead {
  color: var(--muted);
}
input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  padding: 11px 0;
  text-align: right;
}
input:focus {
  outline: none;
}
button {
  border: 0;
  background: none;
  color: var(--muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: grid;
}
button:hover {
  color: var(--fg);
}
</style>
