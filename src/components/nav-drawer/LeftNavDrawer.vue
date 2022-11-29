<template>
    <v-navigation-drawer
      v-model="leftNavDrawer.model"
      :width="leftNavDrawer.width"
      :src="leftNavDrawer.bgImg"
      :dark="leftNavDrawer.dark"
      :light="leftNavDrawer.light"
      app
      :class="leftNavDrawer.color"
    >
      <v-list-item  @click="$emit('navChildClick',leftNavDrawer.home)" v-show="leftNavDrawer.showHome">
        <v-list-item-content>
          <v-list-item-title class="title">
            {{leftNavDrawer.home.text}}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{leftNavDrawer.home.subtitle}}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <template v-for="item in leftNavDrawer.items">
          <v-list-group
            v-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
            color="white"
            active-class="teal accent-4"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
              <v-list-item
                v-for="(child, i) in item.children"
                :key="i"
                link
                @click="$emit('navChildClick',child)"
              >
                <v-list-item-action v-if="child.icon">
                  <v-icon>{{ child.icon }}</v-icon>
                </v-list-item-action>
                <v-list-item-action v-else>
                  <v-spacer></v-spacer>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ child.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
          </v-list-group>
          <v-list-item
            v-else
            :key="item.text"
            link
            @click="$emit('navChildClick',item)"
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
</template>
<script>
export default {
  name: 'LeftNavDrawer',
  props: ['leftNavDrawer'],
  data: () => ({
  }),
  methods:{
    navChildClick: function (item) {
      this.$emit('navChildClick',item)
    }
  }
}
</script>