# notation/

`Abc.tsx` renders ABC notation (from variant `abc` and lesson `abc` blocks) to an SVG staff with abcjs 6.7.1. abcjs is loaded lazily. The ABC source can be expanded under the staff. Gate L4 (in packages/verify) checks that the notation agrees with the reference solution; the app only renders it.
