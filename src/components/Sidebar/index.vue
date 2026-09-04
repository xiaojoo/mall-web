<template>
  <div class="menu">
    <div v-for="(menu, index) in menus" :key="index" class="menu-item">
      <div class="menu-header" @click="toggleMenu(index)">
        <svg-icon
          :name="menu.icon"
          color="#ffffff"
          width="24px"
          height="24px"
          class="input-icon"
        />
        <span>{{ menu.title }}</span>
        <span class="caret" :class="{ rotate: menu.open }">
          <svg-icon
            name="chevron-right"
            color="#ffffff"
            width="20px"
            height="20px"
            class="input-icon"
          />
        </span>
      </div>

      <div class="submenu" v-if="menu.children" :class="{ open: menu.open }">
        <template v-for="(submenu, subIndex) in menu.children">
          <div
            v-if="submenu.link"
            :key="'link-' + subIndex"
            class="submenu-item-no-children"
            :class="{ active: activeMenu === submenu.link }"
            @click="setActive(submenu.link)"
          >
            <svg-icon
              :name="menu.icon"
              color="#ffffff"
              width="24px"
              height="24px"
              class="input-icon"
            />
            <span>{{ submenu.title }}</span>
          </div>
          <div class="submenu-item" v-else :key="'submenu-' + subIndex">
            <div class="submenu-header" @click="toggleSubmenu(menu, subIndex)">
              <svg-icon
                :name="menu.icon"
                color="#ffffff"
                width="24px"
                height="24px"
                class="input-icon"
              />
              <span>{{ submenu.title }}</span>
              <span class="caret" :class="{ rotate: submenu.open }">
                <svg-icon
                  name="chevron-right"
                  color="#ffffff"
                  width="20px"
                  height="20px"
                  class="input-icon"
                />
              </span>
            </div>
            <div
              class="submenu nested"
              v-if="submenu.children"
              :class="{ open: submenu.open }"
            >
              <ul
                v-for="(child, childIndex) in submenu.children"
                :key="'child-' + childIndex"
              >
                <li
                  class="child-link"
                  :class="{ active: activeMenu === child.link }"
                  style="display: flex; align-items: center"
                  @click="setActive(child.link)"
                >
                  <svg-icon
                    :name="menu.icon"
                    color="#ffffff"
                    width="24px"
                    height="24px"
                    class="input-icon"
                  />
                  <span class="submenu-item">{{ child.title }}</span>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'

interface MenuItem {
  title: string
  link?: string
  icon?: string
  open: boolean
  children?: MenuItem[]
}

const props = defineProps<{
  menus: MenuItem[]
}>()

const emit = defineEmits<{
  (e: 'toggle-menu', updatedMenus: MenuItem[]): void
}>()

const activeMenu = ref<string | null>(null)

const toggleMenu = (index: number) => {
  props.menus.forEach((menu, i) => {
    menu.open = i === index ? !menu.open : false
    if (menu.children) {
      menu.children.forEach((child) => (child.open = false))
    }
  })
  emit('toggle-menu', props.menus)
}

const toggleSubmenu = (menu: MenuItem, subIndex: number) => {
  if (!menu.children) return
  menu.children.forEach((child, i) => {
    child.open = i === subIndex ? !child.open : false
  })
  emit('toggle-menu', props.menus)
}

const setActive = (link: string | undefined) => {
  if (link) {
    activeMenu.value = link
  }
}
</script>

<style scoped lang="scss">
.menu {
  cursor: pointer;

  .menu-item {
    border-bottom: 1px solid #2c3e50;
  }

  .menu-header {
    position: relative;
    padding: 0.935rem 1.25rem;
    display: flex;
    align-items: center;
    color: #ffffff;

    &:hover {
      background-color: #3b5998;
    }

    .menu-icon {
      margin-right: 0.935rem;
    }

    .caret {
      transition: transform 0.3s ease;
      position: absolute;
      right: 0.935rem;

      &.rotate {
        transform: rotate(90deg);
      }
    }
  }

  .submenu {
    max-height: 0;
    overflow: hidden;
    background-color: #103784;
    transition: max-height 0.3s ease-in-out;

    &.open {
      max-height: 500px;
    }

    .submenu-item-no-children,
    .child-link {
      display: flex;
      align-items: center;
      color: #ffffff;
      padding: 0.935rem 1.25rem;

      &.active {
        background-color: #3b5998;
      }

      &:hover {
        background-color: #3b5998;
      }
    }
  }

  .submenu-item {
    color: #ffffff;
    text-decoration: none;

    .submenu-header {
      position: relative;
      display: flex;
      align-items: center;
      padding: 0.935rem 1.25rem;

      .caret {
        transition: transform 0.3s ease;
        position: absolute;
        right: 0.935rem;

        &.rotate {
          transform: rotate(90deg);
        }
      }

      &:hover {
        background-color: #3b5998;
      }
    }

    .nested {
      .child-link {
        padding: 0.935rem 1.25rem;

        &:hover {
          background-color: #3b5998;
        }
      }
    }
  }
}
</style>
