<template>
  <div class="page">
    <div class="body">
      <trading-vue
          ref="tvjs"
          title-txt="₿N₿USD 🔥"
          :data="this.dc"
          :width="this.width"
          :height="this.height"
          :overlays="overlays"
          :color-back="colors.colorBack"
          :color-grid="colors.colorGrid"
          :color-text="colors.colorText"
          @line-position-changed="onLinePositionUpdate"
      ></trading-vue>
    </div>
    <div class="footer">
      <button @click='onAddNewLine'>Добавить линию</button>
      <input placeholder="Цена" v-model="linePrice"/>
    </div>
  </div>
</template>

<script>
import TradingVue from "trading-vue-js";
import {DataCube} from "trading-vue-js";
import XP from 'tvjs-xp'

import axios from "axios";
import MyLineTool from "@/components/overlays/MyLineTool.vue";

const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
export default {
  components: {TradingVue},
  data() {
    const width = window.innerWidth;
    const height = window.innerHeight * 0.8;
    const dc = new DataCube();
    return {
      width,
      height,
      dc,
      ws: null,
      colors: {
        colorBack: '#fff',
        colorGrid: '#eee',
        colorText: '#333',
      },
      overlays: [MyLineTool],
      ext: Object.values(XP),
      linePrice: 330
    };
  },
  props: {
    imageUrl: {
      type: String,
    },
  },
  created() {

  },
  mounted() {
    window.addEventListener('resize', this.onResize)
    this.connect();

    // подписываемся на событие изменнеия размер данных по времени,
    // которое возвращается range [t1, t2] начальная точка координат времении конечная.
    this.dc.onrange(this.getData);

  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onAddNewLine() {
      this.dc.add('onchart', {
        type: 'MyLineTool',
        name: 'Линиая 1',
        data: [],
        settings: {
          price: this.linePrice,
          lineWidth: 3,
          lineColor: 'red'
        }
      })
    },
    onLinePositionUpdate({lineIndex, newPrice}) {
      this.dc.merge(`onchart.MyLineTool${lineIndex}.settings`, {price: newPrice})


      console.log(`Линия перемещена, нвоая цена: ${newPrice}`)
    },
    onResize(event) {
      this.width = window.innerWidth
      this.height = window.innerHeight * 0.8
    },
    async getData(range) {
      let [t1, t2] = range;// начало и конец временного отрезка за который получим данные
      let Kline = `https://dapi.binance.com/dapi/v1/klines?symbol=BNBUSD_PERP&interval=1m&startTime=${t1}&endTime=${t2}`;
      try {
        const response = await axios.get(Kline);
        const ohlcv = await response.data.map(subarray => {
          let container = [];
          let i;
          for (i = 0; i < 6; i++) {
            container[i] = Number(subarray[i]);
          }
          return container;
        });
        this.dc.merge('chart.data', ohlcv);
        return true;
      } catch (err) {
        return false;
      }
    },
    connect() {
      let DataSuccess = this.getData([new Date().getTime() - HOUR * 10, new Date().getTime()]); // данные за последние 10 часов (600 минут)
      if (DataSuccess) {
        this.subscribeData();
        this.$refs.tvjs.resetChart()
        window.app = this;
      }
    },
    subscribeData() {
      this.ws = new WebSocket('wss://dstream.binance.com/stream?streams=bnbusd_perp@aggTrade'); //Получаем агригированную сделку за последние 100 милисекунд
      this.ws.addEventListener('open', (event) => {
        this.onWebsocketOpen(event)
      });
      this.ws.addEventListener('message', (event) => {
        this.handleNewMessage(event)
      });
      this.ws.addEventListener('close', (event) => {
        this.onWebsocketClose(event)
      });
    },
    onWebsocketOpen() {
      console.log("connected to WebSocket!");
    },
    handleNewMessage(event) {
      let message = JSON.parse(event.data);
      let trade = message.data;
      this.dc.update({ // обвновляем в кубе последнию свечу согласно времени и полученным данным по совершенным агригированным сделкам
        t: trade.T,     // Exchange time (optional)
        price: Number(trade.p),   // Trade price
        volume: Number(trade.q),  // Trade amount
      });
    },
    onWebsocketClose(event) {
      console.log('Socket is closed. Reconnect will be attempted in 5 second.', event.reason);
      setTimeout(() => {
        try {
          this.connect();
        } catch (err) {
          this.onWebsocketClose({reason: err});
        }
      }, 5000);
    },
  },
  computed: {
    image() {
      return `background-image: url(${this.imageUrl})`;
    },
  },
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

  .footer {
    display: flex;
    width: 100%;
    background-color: #fcfcfc;
    cursor: pointer;
  }
</style>
