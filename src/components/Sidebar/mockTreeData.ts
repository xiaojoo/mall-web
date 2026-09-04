import type { TreeItem } from './types'

export const mockTreeData: TreeItem[] = [
  {
    id: 1,
    label: 'Root',
    expanded: true,
    icon: 'folder',
    children: [
      {
        id: 2,
        label: 'Documents',
        expanded: false,
        icon: 'folder-open',
        children: [
          {
            id: 5,
            label: 'Work',
            icon: 'briefcase',
            children: [
              { id: 8, label: 'Project A', icon: 'file-text' },
              { id: 9, label: 'Project B', icon: 'file-text' },
            ],
          },
          {
            id: 6,
            label: 'Personal',
            icon: 'user',
            children: [
              { id: 10, label: 'Resume.pdf', icon: 'file-pdf' },
              { id: 11, label: 'Family Photo.jpg', icon: 'image' },
            ],
          },
        ],
      },
      {
        id: 3,
        label: 'Downloads',
        expanded: true,
        icon: 'download',
        children: [
          { id: 7, label: 'Game.exe', icon: 'play' },
          { id: 12, label: 'Movie.mp4', icon: 'film' },
        ],
      },
      {
        id: 4,
        label: 'Pictures',
        icon: 'image',
        children: [
          { id: 13, label: 'Vacation', icon: 'camera' },
          { id: 14, label: 'Wedding', icon: 'heart' },
        ],
      },
    ],
  },
  {
    id: 15,
    label: 'Network',
    icon: 'wifi',
    children: [
      { id: 16, label: 'Wi-Fi', icon: 'wifi' },
      { id: 17, label: 'Bluetooth', icon: 'bluetooth' },
    ],
  },
]
