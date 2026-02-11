import { requestWidgetUpdate } from 'react-native-android-widget';
import { FinanceWidget } from '../widgets/FinanceWidget';
import { formatPrice } from '../utils/format';

export const widgetService = {
  /**
   * Pushes latest finance stats to the Android Widget
   */
  async updateFinanceWidget(data: {
    netProfit: number;
    grossRevenue: number;
    operationalExpenses: number;
    vat: number;
    margin: number;
  }) {
    try {
      await requestWidgetUpdate({
        widgetName: 'FinanceWidget',
        renderWidget: () => (
          <FinanceWidget 
            netProfit={formatPrice(data.netProfit)}
            grossRevenue={formatPrice(data.grossRevenue)}
            expenses={formatPrice(data.operationalExpenses + data.vat)}
            margin={`%${data.margin.toFixed(0)} MARJ`}
          />
        ),
      });
      console.log('[WidgetService] Finance Widget Updated.');
    } catch (e) {
      console.warn('[WidgetService] Update failed:', e);
    }
  }
};
