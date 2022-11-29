const objectData = {
  items: [
    {
      id: 1,
      name: '點位',
      children: [
        { id: 2, name: '水位計1' },
        { id: 3, name: '水位計2' },
        { id: 4, name: '水位計3' },
      ],
    },
    {
      id: 5,
      name: '淹水區域',
      children: [
        {
          id: 6,
          name: '動態淹水',
        },
        {
          id: 10,
          name: '靜態淹水',
        },
      ],
    },
    {
      id: 15,
      name: '降雨效果',
      children: [
        { id: 16, name: '降雨區域1' },
        { id: 17, name: '降雨區域2' },
        { id: 18, name: '降雨區域3' },
      ],
    },
    {
      id: 19,
      name: 'Dummy',
      children: [
        {
          id: 20,
          name: 'Tutorials',
          children: [
            { id: 21, name: 'Basic layouts : mp4' },
            { id: 22, name: 'Advanced techniques : mp4' },
            { id: 23, name: 'All about app : dir' },
          ],
        },
        { id: 24, name: 'Intro : mov' },
        { id: 25, name: 'Conference introduction : avi' },
      ],
    },
  ],
}

export default objectData