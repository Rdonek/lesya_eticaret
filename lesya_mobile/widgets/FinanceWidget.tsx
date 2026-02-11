import React from 'react';
import { FlexWidget, TextWidget, SvgWidget } from 'react-native-android-widget';

interface FinanceWidgetProps {
  netProfit: string;
  grossRevenue: string;
  expenses: string;
  margin: string;
}

export function FinanceWidget({ 
  netProfit = '0₺', 
  grossRevenue = '0₺', 
  expenses = '0₺',
  margin = '%0'
}: FinanceWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#171717',
        borderRadius: 32,
        padding: 24,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Row: Label & Margin */}
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget
            text="NET İŞLETME KÂRI"
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: '#A3A3A3',
              fontFamily: 'sans-serif-medium',
            }}
          />
          <TextWidget
            text={netProfit}
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#FFFFFF',
              fontFamily: 'sans-serif-black',
              marginTop: 4,
            }}
          />
        </FlexWidget>
        
        <FlexWidget 
            style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                paddingHorizontal: 10, 
                paddingVertical: 4, 
                borderRadius: 8 
            }}
        >
            <TextWidget 
                text={margin} 
                style={{ fontSize: 10, fontWeight: 'bold', color: '#34D399' }} 
            />
        </FlexWidget>
      </FlexWidget>

      {/* Bottom Grid */}
      <FlexWidget 
        style={{ 
            flexDirection: 'row', 
            borderTopWidth: 1, 
            borderTopColor: 'rgba(255,255,255,0.1)',
            paddingTop: 16,
            justifyContent: 'space-between'
        }}
      >
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget
            text="CİRO"
            style={{ fontSize: 8, color: '#737373', fontWeight: 'bold' }}
          />
          <TextWidget
            text={grossRevenue}
            style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 'bold', marginTop: 2 }}
          />
        </FlexWidget>

        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget
            text="GİDER"
            style={{ fontSize: 8, color: '#737373', fontWeight: 'bold' }}
          />
          <TextWidget
            text={expenses}
            style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 'bold', marginTop: 2 }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
