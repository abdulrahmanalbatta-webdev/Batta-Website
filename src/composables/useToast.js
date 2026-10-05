import { ref } from 'vue'

const message = ref('')
const visible = ref(false)
let timer

export function useToast() {
  function showToast(text, duration = 2800) {
    message.value = text
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (visible.value = false), duration)
  }

  return { message, visible, showToast }
}
