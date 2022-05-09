<script>

import { Overlay, Tool } from 'trading-vue-js'

export default {
  name: 'MyLineTool',
  mixins: [Overlay, Tool],
  methods: {
    meta_info() {
      return { author: 'KEK_IS_BACK', version: '1.0.1' }
    },

    tool() {
      return {
        group: 'Lines',
        icon: '',
        type: 'MyLineTool',
        data: [],
      }
    },

    draw(ctx) {
      let layout = this.$props.layout
      if(!layout || !this.price) {
        return;
      }

      if (this.price) {
        ctx.lineWidth = this.lineWidth
        ctx.strokeStyle = this.lineColor

        ctx.beginPath()
        let y = layout.$2screen(this.price) // y - Mapping
        ctx.moveTo(0, y)
        ctx.lineTo(layout.width, y)
        ctx.stroke()

        // if (this.label) {
        //   this.drawLabel(ctx, y, this.$props.data)
        // }
      }
    },

    drawLabel(ctx, lineY, lineData) {
      //
      // let side = lindeData[2] ? 1 : -1
      // lineY += 2.5 * side
      //
      // ctx.font = this.new_font
      //
      // let pos = lindeData[4] || this.y_position
      // let w = ctx.measureText(lindeData[1]).width + 10
      // let y = this.layout.height * (1.0 - pos)
      //
      // y = Math.floor(y)
      //
      // ctx.fillStyle = lindeData[3] || this.flag_color
      //
      // ctx.beginPath()
      // ctx.moveTo(lineY, y)
      // ctx.lineTo(lineY + 10 * side, y - 10 * side)
      // ctx.lineTo(lineY + (w + 10) * side, y - 10 * side)
      // ctx.lineTo(lineY + (w + 10) * side, y + 10 * side)
      // ctx.lineTo(lineY + 10 * side, y + 10 * side)
      // ctx.closePath()
      // ctx.fill()
      //
      // ctx.fillStyle = this.label_color
      // ctx.textAlign = side < 0 ? 'right' : 'left'
      // ctx.fillText(lindeData[1], lineY + 15 * side, y + 4)
    },

    use_for() {
      return ['MyLineTool']
    },

    data_colors() {
      return ['green']
    },

    mousedown(e) {
      let layout = this.$props.layout

      let lineY = layout.$2screen(this.price)

      let dragZone = 10

      if ((e.clientY - lineY <= dragZone && e.clientY - lineY >= 0)
          || (lineY - e.clientY <= dragZone && lineY - e.clientY >= 0)
      ) {
        this.dragging = true
      }
    },

    mouseup(e) {
      if (!this.dragging) {
        return
      }

      let layout = this.$props.layout

      const newPrice = Math.trunc(layout.screen2$(e.clientY).toFixed(2) * 100) / 100
      this.dragging = false
      const payload = {lineIndex:0 , newPrice}
      this.$emit('line-position-changed', payload)
    },

    mousemove(e) {
      // const layout = this.$props.layout
    },
  },

  // Define internal setting & constants here
  computed: {
    sett() {
      return this.$props.settings
    },
    price() {
      return this.$props.settings.price
    },
    lineWidth() {
      return this.$props.settings.lineWidth
    },
    lineColor() {
      return this.$props.settings.lineColor
    }
  },

  data() {
    return {
      dragging: false
    }
  }
}

</script>