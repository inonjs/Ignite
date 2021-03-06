import path from 'path';
import fs from 'fs';
import {
  initOptions,
  initPlugins,
  initBlogPosts,
  initSearchIndex,
  initBuildMessages,
  getAuthor,
  getPages
} from '../ignite';

describe('initPlugins', () => {
  test('should initialize options', async () => {
    const result = await initPlugins({
      plugins: [['pluginName', '../extensions/notRealExtension/']]
    });
    expect(result).toEqual({
      plugins: [['pluginName', '../extensions/notRealExtension/', {}]]
    });
  });
  test('should call init function if present', async () => {
    const result = await initPlugins({
      plugins: [['pluginName', 'src/extensions/testExtension/', { foo: 'bar' }]]
    });
    expect(result).toMatchSnapshot();
  });
});

describe('initBlogPosts', () => {
  test('do nothing with when docs contain no blog posts', async () => {
    const result = await initBlogPosts({ src: '/' });
    expect(result).toBeNull();
  });

  test('attach creation date to each blog post', async () => {
    const result = await initBlogPosts({
      src: 'examples/blog/docs'
    });
    expect(result).toEqual([
      { birth: 1526593244000, path: 'blog/FirstPost.md' },
      { birth: 1526623637000, path: 'blog/ShorterPost.md' }
    ]);
  });
});

describe('getAuthor', () => {
  test('works with obj way', () => {
    expect(
      getAuthor({
        author: {
          email: 'lisowski54@gmail.com',
          name: 'Andrew Lisowski'
        }
      })
    ).toEqual({
      email: 'lisowski54@gmail.com',
      name: 'Andrew Lisowski'
    });
  });

  test('works with string way', () => {
    expect(
      getAuthor({
        author: 'Adam Dierkens <adam@dierkens.com>'
      })
    ).toEqual({
      name: 'Adam Dierkens',
      email: 'adam@dierkens.com'
    });
  });
});

test('initSearchIndex', async () => {
  const result = await initSearchIndex({
    baseURL: '/',
    index: 'index.md',
    src: path.resolve('examples/multi-root/docs'),
    navItems: {
      root: '/Root1',
      First: '/Root1',
      Second: '/Root2'
    }
  });

  result.sort((a, b) => a.id.localeCompare(b.id));
  expect(result).toMatchSnapshot();
});

test('getPages - doc outside root', () => {
  jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(`
    - [outside](../outside/docs/folder.md)
  `);
  const result = getPages({
    index: 'index.md',
    src: path.resolve('examples/home')
  });

  result.sort((a, b) => a.localeCompare(b));
  expect(
    result.find(link => link.includes('examples/outside/docs/folder.md'))
  ).toBeDefined();
});

test('initBuildMessages', () => {
  const prod = initBuildMessages({});
  const dev = initBuildMessages({
    watch: true
  });

  expect(dev.compilationSuccessInfo).not.toEqual(prod.compilationSuccessInfo);
});

describe('initOptions', () => {
  test('uses rc file', async () => {
    const result = await initOptions({
      src: 'examples/multi-root/docs'
    });
    expect(result).toMatchSnapshot();
  });
});
