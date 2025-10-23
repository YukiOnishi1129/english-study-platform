# コーディング規約メモ

## Next.js のページ関数

- App Router のページ／レイアウトでは次の形で関数を定義する。
  ```ts
  export default async function Page({ params }: PageProps<"/units/[unitId]">) {
    const { unitId } = await params;
    // ...
  }
  ```
- `PageProps` は Next.js 15 からグローバルで参照可能なので `import` しない。
- `params` は `await` してから各プロパティを取り出す。

`generateMetadata` 等の補助関数も同様に `{ params }: PageProps<...>` を受け取り、`await params` で値を展開すること。

## Next.js のレイアウト関数

- レイアウトでは `LayoutProps` をそのまま受け取り、`import` しない。
- ルートに応じた型パラメータを渡し `props.children` を描画する。
  ```ts
  export default function Layout(props: LayoutProps<"/dashboard">) {
    return <>{props.children}</>;
  }
  ```
