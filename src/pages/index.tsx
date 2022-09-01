import { format } from 'date-fns';
import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { ReactElement, useState } from 'react';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';
import { Post } from '../components/Post';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const { results, next_page } = postsPagination;
  function formatPosts(p: Post[]): Post[] {
    return p.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          "dd MMM' 'yyyy",
          {
            locale: ptBR,
          }
        ),
        data: {
          title:
            typeof post.data.title === 'string'
              ? post.data.title
              : RichText.asText(post.data.title),
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });
  }

  const [posts, setPosts] = useState(formatPosts(results));
  const [nextPage, setNextPage] = useState(next_page);

  async function handleLoadMorePosts(): Promise<void> {
    const newPosts = await (await fetch(nextPage)).json();

    setPosts([...posts, ...formatPosts(newPosts.results)]);
    setNextPage(newPosts.next_page);
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        {posts.map(p => {
          return <Post key={p.uid} post={p} />;
        })}
        {nextPage && (
          <button onClick={handleLoadMorePosts} type="button">
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    pageSize: 5,
  });

  return {
    props: {
      postsPagination: {
        results: postsResponse.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        }),
        next_page: postsResponse.next_page,
      },
    },
  };
};
