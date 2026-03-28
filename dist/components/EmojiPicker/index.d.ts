import React from 'react';
interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
    primaryColor: string;
}
export declare const EmojiPicker: React.FC<EmojiPickerProps>;
export {};
