import 'antd';

declare module 'antd' {
  export interface RowProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
  }
  
  export interface ColProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
  }

  export interface InputNumberProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
    
  }
  export interface UploadProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
    directory?:boolean;
}

export interface ButtonProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; // 假设你要添加额外的 onClick 类型
}

  export interface ModalProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
  }

  export interface InputProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; // 假设你要添加额外的 onChange 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
    id?: string | number,
  }

  export interface MenuProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
    }

export interface MenuItemProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
    onClick?: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void; // 假设你要添加额外的 onClick 类型
    icon?: React.ReactNode; // 假设你要添加额外的 icon 类型
}

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
    color?: string; // 假设你要添加额外的 color 类型    
    mouseEnterDelay?: number; // 假设你要添加额外的 mouseEnterDelay 类型
    mouseLeaveDelay?: number; // 假设你要添加额外的 mouseLeaveDelay 类型
    overlayInnerStyle?: React.CSSProperties; // 假设你要添加额外的 overlayInnerStyle 类型
    cursor? :string;
    scale?: string;
}

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    style?: React.CSSProperties; // 假设你要添加额外的 style 类型
    overlayClassName?:string;
}

export interface ButtonProps extends React.HTMLAttributes<HTMLDivElement>{
    children?: React.ReactNode; // 假设你要添加额外的 children 类型
    icon?: React.ReactNode; // 假设你要添加额外的 icon 类型
}


}
