const objectData = {
  items: [
    {
      id: 1,
      name: '水位計區域',
      children: [
        { id: 2, name: '水位計1區' },
        { id: 3, name: '水位計2區' },
        { id: 4, name: '水位計3區' },
      ],
    },
    {
      id: 5,
      name: '封閉路段',
      children: [
        {
          id: 6,
          name: '路段1',
        },
        {
          id: 10,
          name: '路段2',
        },
      ],
    },
    {
      id: 15,
      name: '警戒區域',
      children: [
        { id: 16, name: '警戒區1' },
        { id: 17, name: '警戒區2' },
        { id: 18, name: '警戒區3' },
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