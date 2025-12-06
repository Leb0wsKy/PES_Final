"""Minimal Streamlit app to test the local RAG pipeline.

Run:
    cd Dashboard/RAG_Chatbot
    pip install -r requirements.txt  # ensure pandas, scikit-learn, streamlit
    streamlit run streamlit_app.py
"""
import streamlit as st
from main import RAG


@st.cache_resource
def init_rag():
    r = RAG()
    r.build_index()
    return r


def main():
    st.set_page_config(page_title='RAG Test', layout='centered')
    st.title('Minimal RAG Test — PowerPulse')

    rag = init_rag()

    st.markdown('Ask a question about the SIDED or PV numeric datasets available in the repo.')
    q = st.text_input('Question', '')
    if st.button('Ask') and q.strip():
        with st.spinner('Retrieving and generating answer...'):
            resp, ctx = rag.answer(q)
        st.subheader('Answer')
        st.write(resp)

        with st.expander('Context used'):
            for c in ctx:
                st.markdown(f"**{c.get('topic')}** — score: {c.get('score', 0):.3f}")
                st.text(c.get('content'))


if __name__ == '__main__':
    main()
