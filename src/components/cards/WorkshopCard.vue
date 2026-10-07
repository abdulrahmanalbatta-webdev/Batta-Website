<script setup>
import { computed, ref } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import RegistrationButton from '@/components/registration/RegistrationButton.vue'
import { texts } from '@/data/texts'

const props = defineProps({
  workshop: { type: Object, required: true },
})

// the student's own booking or cancelling moves the meter without reloading the list
const delta = ref(0)
const taken = computed(() => props.workshop.taken + delta.value)
const seatsLeft = computed(() => Math.max(0, props.workshop.seats - taken.value))
const fill = computed(() => Math.min(100, Math.round((taken.value / props.workshop.seats) * 100)))
const closed = computed(() => (props.workshop.ended ? 'انتهت الورشة' : seatsLeft.value <= 0 ? texts.ui.buttons.seats_full : ''))
</script>

<template>
  <article class="card workshop">
    <div class="date">
      <b>{{ workshop.day }}</b>
      <span>{{ workshop.month }}</span>
    </div>

    <div class="info">
      <div class="tags">
        <span class="pill line"><BaseIcon :name="workshop.online ? 'monitor' : 'pin'" :size="14" />{{ workshop.format }}</span>
      </div>
      <h3><RouterLink class="title-link" :to="{ name: 'workshop', params: { id: workshop.id } }">{{ workshop.title }}</RouterLink></h3>
      <span class="meta">
        <span><BaseIcon name="clock" :size="16" />{{ workshop.time }}</span>
        <RouterLink class="details" :to="{ name: 'workshop', params: { id: workshop.id } }">التفاصيل والأسئلة <BaseIcon name="arrow" :size="14" /></RouterLink>
      </span>
    </div>

    <div class="action">
      <div class="seats">
        <span>المقاعد</span>
        <span><b>{{ seatsLeft }}</b> متبقية من {{ workshop.seats }}</span>
      </div>
      <div class="meter"><i :style="{ width: `${fill}%` }" /></div>
      <RegistrationButton type="workshop" :target="workshop.id" :label="texts.ui.buttons.book_seat" :closed="closed" :locked="workshop.ended" block @change="delta += $event" />
    </div>
  </article>
</template>

<style scoped>
.title-link {
  color: inherit;
}
.title-link:hover {
  color: var(--primary-600);
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px 16px;
  flex-wrap: wrap;
  color: var(--muted);
}
.meta > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.details {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--primary-600);
  font-weight: 700;
}
.workshop {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
}
.date {
  width: 84px;
  border-radius: 14px;
  background: var(--fg);
  color: var(--bg);
  text-align: center;
  padding: 10px 6px;
  line-height: 1.2;
}
.date b {
  display: block;
  font-size: 32px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.date span {
  font-size: 13px;
  font-weight: 700;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.action {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 190px;
}
.seats {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--muted);
}
.seats b {
  color: var(--fg);
}
.meter {
  height: 6px;
  border-radius: 99px;
  background: var(--tint);
  overflow: hidden;
}
.meter i {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: var(--primary);
}
@media (max-width: 760px) {
  .workshop {
    grid-template-columns: auto 1fr;
  }
  .action {
    grid-column: 1 / -1;
    min-width: 0;
  }
}
</style>
