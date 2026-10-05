<script setup>
import SectionHeading from '@/components/ui/SectionHeading.vue'
import StarRating from '@/components/ui/StarRating.vue'
import { testimonials } from '@/data/site'
import { texts } from '@/data/texts'
</script>

<template>
  <section class="section">
    <div class="container">
      <SectionHeading :eyebrow="texts.home.testimonials.eyebrow" :title="texts.home.testimonials.title" />
      <div class="grid g3">
        <figure v-for="t in testimonials" :key="t.name" class="card quote">
          <StarRating />
          <blockquote>{{ t.text }}</blockquote>
          <figcaption>
            <span class="avatar">{{ t.initial }}</span>
            <div>
              <b>{{ t.name }}</b>
              <span>{{ t.role }}</span>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
.quote {
  margin: 0;
  gap: 16px;
}
blockquote {
  margin: 0;
  font-size: 15.5px;
}
figcaption {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
  background: var(--fg);
}
.quote:nth-child(2) .avatar {
  background: var(--primary);
}
figcaption b {
  display: block;
  color: var(--fg);
  font-size: 15px;
}
figcaption span {
  font-size: 13px;
  color: var(--muted);
}
.quote:nth-child(1) .avatar,
.quote:nth-child(3) .avatar {
  color: var(--bg);
}
</style>
