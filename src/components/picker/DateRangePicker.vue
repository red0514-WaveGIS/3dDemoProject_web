<template>
  <v-dialog
    ref="dialog"
    v-model="dateRangeModel"
    :return-value.sync="currentDateRange"
    width="300"
    persistent
    scrollable
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-on="on"
        v-bind="attrs"
        :label="itemTitle"
        v-model="dateRangeText"
        prepend-icon="mdi-calendar-month-outline"
        :outlined="outlined"
        :dense="dense"
        :clearable="clearable"
        :hide-details="hideDetails"
        :required="ruleIsRequired"
        :rules="rule"
        :dark="dark"
        :disabled="disabled"
      ></v-text-field>
    </template>
    <v-date-picker v-model="currentDateRange" locale="zh-cn" scrollable range  
      @click:date="validateDate">
      <v-card elevation="0" width="100%">
        <v-alert
          dense
          outlined
          type="error"
          v-if="mustRangeIsShow"
        >
            必須選擇區間
        </v-alert>
        <v-card-text>
          <v-row>
            <v-layout d-flex justify-end>
              <v-btn color="primary" text @click="validateDate(), clearHandler()">取消</v-btn>
              <v-btn color="primary" text @click="validateDate(), okHandler()">確定</v-btn>
            </v-layout>
          </v-row>
        </v-card-text>
      </v-card>
    </v-date-picker>
  </v-dialog>
</template>

<script>
export default {
  name: "DateRangePicker",
  model: {
    prop: "dateRange",
    event: "input",
  },
  props: [
    "dateRange",
    "itemTitle",
    "outlined",
    "dense",
    "clearable",
    "hideDetails",
    "propRules",
    "ruleIsRequired",
    "mustSelectRange",
    "dark",
    "disabled"
  ],
  data: () => ({
    dateRangeModel: false,
    currentDateRange: [],
    rule: [
      (value) => !!value || '必填欄位'
    ],
    showText: "",
    mustRangeIsShow: false
  }),
  mounted: function(){
    if(this.propRules) {
      this.rule = this.propRules?.concat(this.rule)
    }
  },
  methods: {
    okHandler: function () {
      if(this.mustSelectRange) {
        const dateRangeLengthBiggerThanOne =  this.currentDateRange.length > 1
        switch(dateRangeLengthBiggerThanOne) {
          case true: 
            this.mustRangeIsShow = false;
            this.$refs.dialog.save(this.currentDateRange);
            this.$emit("input", this.currentDateRange);
            break;
          default:
            this.mustRangeIsShow = true;
        }
      } else {
        this.$refs.dialog.save(this.currentDateRange);
        this.$emit("input", this.currentDateRange);
      }
    },
    clearHandler: function () {
      this.dateRangeModel = false;
      // this.currentDateRange = []
      this.$emit("input", null);
    },
    sortRange: function(range){
       range.sort((a, b) => {
        return new Date(a) - new Date(b);
      });
    },
    validateDate(boolean= true){
      if(this.ruleIsRequired && this.ruleIsRequired === true) {
        if(this.rule?.length >= 2) this.rule.pop()
        if(this.currentDateRange?.length >= 2 && boolean === true) {
          this.rule = this.rule?.concat([true])
          this.$emit("changeRulesBoolean", this.rule)
        } else {
          this.rule = this.rule?.concat([false])
          this.$emit("changeRulesBoolean", this.rule)
        }
      }
    }
  },
  computed: {
    dateRangeText: {
      get(){
        if(this.currentDateRange != null) {
          this.sortRange(this.currentDateRange)
          return this.currentDateRange.join("~")
        } else {
          return []
        }
      },
      set(){
        this.clearHandler()
      }
    },
  },
  watch: {
    dateRange: {
      immediate: true,
      handler: function () {
        this.currentDateRange = this.dateRange;
      },
    }
  },
};
</script>