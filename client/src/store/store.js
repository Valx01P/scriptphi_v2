import { create } from 'zustand';
import { createFormSlice } from './formSlice';
import { createUserSlice } from './userSlice';

const useStore = create((set, get) => ({
  ...createFormSlice(set, get),
  ...createUserSlice(set),
}))

export default useStore