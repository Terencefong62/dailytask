/**
 * Scale recipe ingredient amounts by serving size with practical rounding.
 */
window.ServingScale = {
  roundAmount(value, unit) {
    const countUnits = ["pcs", "包", "顆", "隻", "個"];
    const spoonUnits = ["tsp", "tbsp", "茶匙", "湯匙"];
    const mlUnits = ["ml", "毫升"];
    const gUnits = ["g", "克"];

    if (countUnits.includes(unit)) {
      return Math.max(1, Math.round(value));
    }
    if (spoonUnits.includes(unit)) {
      const rounded = Math.round(value * 4) / 4;
      if (value > 0 && rounded < 0.25) return 0.25;
      return rounded;
    }
    if (mlUnits.includes(unit)) {
      const rounded = Math.round(value / 10) * 10;
      return value > 0 ? Math.max(10, rounded) : 0;
    }
    if (gUnits.includes(unit)) {
      const rounded = Math.round(value / 10) * 10;
      return value > 0 ? Math.max(10, rounded) : 0;
    }
    return Math.round(value * 10) / 10;
  },

  formatAmount(value, unit, locale) {
    const isZh = locale === "zh";

    if (isZh && value === 0.5 && (unit === "湯匙" || unit === "茶匙")) {
      return "半";
    }

    if (!isZh && value === 0.5) {
      return "½";
    }

    if (Number.isInteger(value)) return String(value);

    const fixed = value.toFixed(2).replace(/\.?0+$/, "");
    return fixed;
  },

  formatMeasurable(item, ratio, locale) {
    const amount = this.roundAmount(item.amount * ratio, item.unit);
    const amountText = this.formatAmount(amount, item.unit, locale);
    const isZh = locale === "zh";

    let text;
    if (isZh) {
      text = `${item.name} ${amountText}${item.unit}`;
      if (item.sub) {
        const subAmount = this.roundAmount(item.sub.amount * ratio, item.sub.unit);
        const subText = this.formatAmount(subAmount, item.sub.unit, locale);
        text += `（約${subText}${item.sub.unit}）`;
      }
      if (item.note) text += `（${item.note}）`;
    } else {
      text = `${item.name} ${amountText} ${item.unit}`;
      if (item.sub) {
        const prefix = item.sub.prefix || "";
        const subAmount = this.roundAmount(item.sub.amount * ratio, item.sub.unit);
        const subText = this.formatAmount(subAmount, item.sub.unit, locale);
        text += ` (${prefix ? `${prefix} ` : ""}${subText} ${item.sub.unit})`;
      }
      if (item.note) text += ` (${item.note})`;
    }

    return text;
  },

  scaleItem(item, ratio, locale) {
    if (item.fixed || item.scalable === false) {
      return { text: item.fixed || item.text, changed: item.changed };
    }

    return {
      text: this.formatMeasurable(item, ratio, locale),
      changed: item.changed,
    };
  },

  scaleSections(sections, ratio, locale) {
    return sections.map((section) => ({
      title: section.title,
      items: section.items.map((item) => this.scaleItem(item, ratio, locale)),
    }));
  },
};
