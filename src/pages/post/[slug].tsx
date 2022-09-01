import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { ReactElement } from 'react';
import { RiCalendarLine, RiTimeLine, RiUserLine } from 'react-icons/ri';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const time = Math.ceil(
    post.data.content
      .reduce((acc, i) => {
        return acc + RichText.asText(i.body);
      }, '')
      .split(/ |\r|\n/g).length / 200
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatPostData(p: Post): any {
    return {
      first_publication_date: format(
        new Date(p.first_publication_date),
        "dd MMM' 'yyyy",
        {
          locale: ptBR,
        }
      ),
      data: {
        title:
          typeof p.data.title === 'string'
            ? p.data.title
            : RichText.asText(p.data.title),
      },
    };
  }

  const formatedPost = formatPostData(post);
  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="" />
      </div>
      <main className={styles.container}>
        <header>
          <h1>{formatedPost.data.title}</h1>
          <div>
            <span>
              <RiCalendarLine />
              {formatedPost.first_publication_date}
            </span>
            <span>
              <RiUserLine />
              {post.data.author}
            </span>
            <span>
              <RiTimeLine />
              {time} min
            </span>
          </div>
        </header>
        <article>
          {post.data.content.map(section => {
            return (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(section.body),
                  }}
                />
              </section>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const { results } = await prismic.getByType('post');

  const paths = results.map(p => {
    return {
      params: {
        slug: p.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params: { slug } }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(slug));

  return {
    props: {
      post: response,
    },
  };
};
