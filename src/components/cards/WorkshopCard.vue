<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useSettings } from '@/composables/useSettings'

const props = defineProps({
  workshop: { type: Object, required: true },
})

const { price } = useSettings()
const priceLabel = computed(() => (props.workshop.free ? 'مجانية' : price(props.workshop.price)))
const seatsLeft = computed(() => props.workshop.seats - props.workshop.taken)
const fill = computed(() => Math.round((props.workshop.taken / props.workshop.seats) * 100))
</script>

<template>
  <article class="card workshop">
    <div class="date">
      <b>{{ workshop.day }}</b>
      <span>{{ workshop.month }}</span>
    </div>

    <div class="info">
      <div class="tags">
        <span class="pill" :class="{ green: workshop.free }">{{ priceLabel }}</span>
        <span class="pill line"><BaseIcon :name="workshop.online ? 'monitor' : 'pin'" :size="14" />{{ workshop.format }}</span>
      </div>
      <h3>{{ workshop.title }}</h3>
      <span class="meta"><span><BaseIcon name="clock" :size="16" />{{ workshop.time }}</span></span>
    </div>

    <div class="action">
      <div class="seats">
        <span>المقاعد</span>
        <span><b>{{ seatsLeft }}</b> متبقية من {{ workshop.seats }}</span>
      </div>
      <div class="meter"><i :style="{ width: `${fill}%` }" /></div>
      <span v-if="workshop.full" class="btn btn-ghost" aria-disabled="true">اكتملت المقاعد</span>
      <RouterLink v-else class="btn btn-primary" :to="{ name: 'enroll', query: { workshop: workshop.id } }">احجز مقعدك</RouterLink>
    </div>
  </article>
</template>

<style scoped>
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
