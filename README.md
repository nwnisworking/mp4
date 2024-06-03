# MP4 Reader + Fragmenter

This library allows user to fragment and read MP4 atom files. The inner workings of the library is simple and will greatly allow users to manipulate and modify atom easily without the hassle of calculating value size every time the atom is changed.

Whenever an Atom Class is read using toBuffer, it will convert all the children inside the items property into buffers. 

For parsing, I used the property that is found in the following [link](https://ossrs.net/lts/zh-cn/assets/files/ISO_IEC_14496-12-base-format-2012-b70dd5f101daecd072700609842c9649.pdf). 

The project itself is to explore the inner workings of an MP4 so there won't be any updates to it. The fragment itself is what video-streaming services used to deliver contents to user. 

For the purpose of testing, use the index.js and modify the `const data`. If the video falls on a I-frame, instead of a key frame, it will not render properly until it reached the next keyframe.
