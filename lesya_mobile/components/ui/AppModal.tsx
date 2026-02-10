import React from 'react';
import { Modal, ModalProps, View, TouchableWithoutFeedback } from 'react-native';

interface AppModalProps extends ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function AppModal({ isOpen, onClose, children, ...props }: AppModalProps) {
  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <TouchableWithoutFeedback>
            <View className="bg-background w-full max-w-sm rounded-2xl p-6 shadow-lg">
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
