import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: {id: string} = {
  id: ''
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{id: string}>) => {
      console.log("Setting user:", action.payload);
      state.id = action.payload.id;
    },
    resetUser: () => initialState,
  },
});

export const { setUser, resetUser } =
  userSlice.actions;

export default userSlice.reducer;
