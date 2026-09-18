declare const brand: unique symbol;

/**
 * Gives a primitive a nominal type.
 *
 * Document ids, page ids and annotation ids are all strings at runtime, which
 * makes them trivially interchangeable by accident. Branding them means the
 * compiler rejects `deletePage(documentId)` even though both are strings, at
 * zero runtime cost.
 */
export type Brand<TValue, TBrand extends string> = TValue & { readonly [brand]: TBrand };
